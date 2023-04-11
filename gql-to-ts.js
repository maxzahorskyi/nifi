const { generateTypeScriptTypes } = require('graphql-schema-typescript');
const { importSchema } = require('graphql-import');

const schema = importSchema('schema.graphql');

generateTypeScriptTypes(schema, 'src/types/graphql.schema.ts')
  .then(() => {
    console.log('DONE');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
