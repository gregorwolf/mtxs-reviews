const cds = require("@sap/cds");
const LOG = cds.log("mtxs-custom");

const {
  fillServiceReplacementCAP: fillServiceReplacement,
} = require("./service-replacement-cap");

cds.on("served", () => {
  const { "cds.xt.DeploymentService": ds } = cds.services;

  ds.before("subscribe", async (req) => {
    LOG.info("subscribe");
    await fillServiceReplacement(req);
  });

  ds.before("upgrade", async (req) => {
    LOG.info("upgrade");
    await fillServiceReplacement(req);
  });
});
