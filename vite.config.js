module.exports = {
  base: "./",
  build: {
    outDir: 'front_dist', // The output directory for the build. Change this to match your Electron app's structure.
    emptyOutDir: true, // Whether to empty the output directory before building. You might want to set this to false if you have other files in the output directory that you don't want to delete.
    rollupOptions: {
    //   external: require('./external-packages'), // List of package names that should be treated as external dependencies. This is needed because Electron has some specific ways it needs to import certain modules.
    },
  },
};
