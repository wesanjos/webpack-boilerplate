module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      stage: 4,
      browsers: ['IE > 9', '> 0.01%'],
    },
  },
};
