import util from "./importPackageUtil";

const initialPackageImport = async (): Promise<string[]> => {
  const packgeFolderPaths = await util.getPackageYamls();

  return packgeFolderPaths;
};

// const updatePackages = async () => {};

export = {
  initialPackageImport,
  // updatePackages,
};
