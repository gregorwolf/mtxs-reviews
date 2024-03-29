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

    booksApiTx = await booksApi.tx(req);

    const books = await booksApiTx.run(
      // Feature not supported: SELECT statement with .forUpdate
      // SELECT.from(Books, req.data.ID).forUpdate()
      SELECT.from(Books, req.data.ID)
    );
    LOG.debug("Books from books_api", books);
    // Updata stock of book in books_api
    const result = await booksApiTx.run(
      // When remote entity used @odata.etag then we get this error message:
      // Error during request to remote service: \nPrecondition required
      UPDATE(Books).set({ stock: req.data.stock }).where({ ID: req.data.ID })
    );
    LOG.debug("Books updated", result);
  });
});
