const cds = require("@sap/cds");
const LOG = cds.log("mtx"),
  DEBUG = cds.debug("mtx|sm");
// Read xsappname of services using xsenv
const xsenv = require("@sap/xsenv");
xsenv.loadEnv();

const services = xsenv.getServices({
  smbookshop: { name: "mtxs-bookshop-db" },
});

const { sm_url, url, clientid, clientsecret, certurl, certificate, key } =
  services.smbookshop;

const axios = require("axios");
const api = axios.create({
  baseURL: sm_url + "/v1/",
  headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use(async (conf) => {
  conf.headers.Authorization = await _token();
  DEBUG?.(conf.method.toUpperCase(), conf.baseURL + conf.url, {
    ...(conf.params && { params: conf.params }),
    ...(conf.data && { data: conf.data }),
  });
  return conf;
});

async function getServiceBindingForTenantId(tenantId) {
  const { data } = await api.get("service_bindings", {
    params: { labelQuery: `tenant_id eq '${tenantId}'` },
  });
  return data.items[0];
}

async function _token() {
  if (!_token.cached || _token.cached.expiry < Date.now() + 30000) {
    const auth = certificate
      ? {
          maxRedirects: 0,
          httpsAgent: new https.Agent({ cert: certificate, key }),
        }
      : { auth: { username: clientid, password: clientsecret } };
    const authUrl = `${certurl ?? url}/oauth/token`;
    const data = `grant_type=client_credentials&client_id=${encodeURI(
      clientid
    )}`;
    const config = { method: "POST", timeout: 5000, data, ...auth };
    const { access_token, expires_in } = await fetchTokenResiliently(
      authUrl,
      config
    );
    _token.cached = { access_token, expiry: Date.now() + expires_in * 1000 };
  }
  return `Bearer ${_token.cached.access_token}`;
}

const maxRetries = 3;
const fetchTokenResiliently = (module.exports.fetchTokenResiliently =
  async function (url, config, retriesLeft = maxRetries) {
    try {
      return (await axios(url, config)).data;
    } catch (error) {
      const { status, headers } = error.response ?? { status: 500 };
      if (status in { 401: 1, 403: 1 } || retriesLeft === 0) throw error;
      const attempt = maxRetries - retriesLeft + 1;
      DEBUG?.(`fetching token attempt ${attempt} failed with`, { error });
      let delay = 0;
      if (status === 429) {
        const retryAfter = headers["retry-after"];
        if (retryAfter) delay = parseInt(retryAfter, 10) * 1000;
        else throw error;
      } else if (status in { 408: 1, 502: 1, 504: 1 }) {
        delay = 300 * 2 ** (attempt - 1);
      } else {
        delay = 1000 * 3 ** (attempt - 1);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchTokenResiliently(url, config, retriesLeft - 1);
    }
  });

module.exports = { getServiceBindingForTenantId };
