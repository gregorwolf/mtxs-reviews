// Read xsappname of services using xsenv
const xsenv = require("@sap/xsenv");
xsenv.loadEnv();

const { getServiceBindingForTenantId } = require("./service-manager");

const services = xsenv.getServices({
  smbookshop: { name: "mtxs-bookshop-db" },
});

module.exports = cds.service.impl(async function () {
  this.on("getBookshopServiceManager", (req) => {
    return services.smbookshop;
  });
  this.on("getServiceBindingForTenantId", (req) => {
    return getServiceBindingForTenantId(req.data.tenantId);
  });
});
