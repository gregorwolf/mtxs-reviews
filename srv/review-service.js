const cds = require("@sap/cds");
const LOG = cds.log("review-service");
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

  this.on("UPDATE", "Books", async (req) => {
    LOG.debug("Books UPDATE request received");
    const booksApi = await cds.connect.to("BooksApiService");
    const { Books } = booksApi.entities;

    const books = await booksApi.tx(req).run(SELECT.from(Books));
    LOG.debug("Books from books_api", books);
  });
});
