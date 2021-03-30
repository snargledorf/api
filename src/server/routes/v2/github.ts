import { FastifyInstance } from "fastify";
import { ManifestModel, addOrUpdatePackage } from "../../../database";
import { validateApiToken } from "../../helpers";
import ghService from "../../ghService/index";

export default async (fastify: FastifyInstance): Promise<void> => {
  // *----------------- import package update --------------------
  fastify.get("/import", { onRequest: validateApiToken }, async () => {
    const yamls = await ghService.initialPackageImport();
    console.log(`yamls length - ${yamls.length}`);

    const batchSize = yamls.length % 2 === 0 ? 150 : 155;
    let batchIndex = 0;

    while (batchIndex < yamls.length) {
      const batch = yamls.slice(batchIndex, batchIndex + batchSize);

      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        // eslint-disable-next-line no-loop-func
        batch.map(async x => {
          const pkg = x as unknown as ManifestModel;
          console.log(`${pkg.PackageIdentifier} / ${pkg.PackageVersion} - ${batchIndex}`);

          await addOrUpdatePackage(pkg);
        }),
      );

      batchIndex += batchSize;
    }

    return {
      Message: `imported ${
        yamls.length
      } packages at ${new Date().toISOString()}`,
    };
  });

  // *----------------- manual package import---------------------
  fastify.post(
    "/manualImport",
    { onRequest: validateApiToken },
    async (req) => {
      const manifests = req.body.manifests as string[];
      const yamls = await ghService.manualPackageImport(manifests);

      console.log(`yamls length - ${yamls.length}`);

      const BATCH_SIZE = yamls.length % 2 === 0 ? 4 : 5;
      let batchIndex = 0;

      while (batchIndex < yamls.length) {
        const batch = yamls.slice(batchIndex, batchIndex + BATCH_SIZE);

        // eslint-disable-next-line no-await-in-loop
        await Promise.all(
          // eslint-disable-next-line no-loop-func
          batch.map(async x => {
            const pkg = x as unknown as ManifestModel;
            console.log(`${pkg.PackageIdentifier} / ${pkg.PackageVersion} - ${batchIndex}`);

            await addOrUpdatePackage(pkg);
          }),
        );

        batchIndex += BATCH_SIZE;
      }

      return {
        Message: `imported ${yamls.length} packages at ${new Date().toISOString()}`,
      };
    },
  );
};
