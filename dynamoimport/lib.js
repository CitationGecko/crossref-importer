var AWS = require('aws-sdk');

// set the defaults
var DYNAMO_TABLE_NAME = process.env.DYNAMO_TABLE_NAME;
var DYNAMO_REGION = process.env.DYNAMO_REGION;

AWS.config.update({ region: DYNAMO_REGION });
var ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });

/**
* Creates a Dynamo-ready request for each individual citation
* to be used in batchWriteItem
*/
function createPutRequest(citeFrom, citeTo) {
  return {
    PutRequest: {
      Item: {
        citeFrom: { 'S': citeFrom },
        citeTo: { 'S': citeTo }
      }
    }
  };
}

/**
 * Wraps an array of citation entries in a DynamoDB query format.
 * Used by batch import routine (dynamo/ingestData.js).
 *
 * @param {array} citationEntries Array of {citeFrom: '', citeTo: ''} objects
 * @param {function} callback Callback function (err, data)
 */
function batchInsert(citationEntries, callback) {
  var params = {
    RequestItems: {},
    ReturnConsumedCapacity: 'TOTAL'
  };

  params.RequestItems[DYNAMO_TABLE_NAME] = citationEntries;

  ddb.batchWriteItem(params, callback);
}


module.exports = {
  createPutRequest: createPutRequest,
  executeBatchInsert: executeBatchInsert
};
