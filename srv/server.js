const cds = require("@sap/cds");
const LOG = cds.log("mtxs-custom");

const {
  fillServiceReplacementCAP: fillServiceReplacement,
} = require("./service-replacement-cap");

// Read xsappname of services using xsenv
const xsenv = require("@sap/xsenv");
xsenv.loadEnv();
const services = xsenv.getServices({
  dest: { tag: "destination" },
});
// fill dependencies for cds.env.requires
const dependencies = [];
dependencies.push(services.dest.xsappname);
cds.env.requires["cds.xt.SaasProvisioningService"] = { dependencies };

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
