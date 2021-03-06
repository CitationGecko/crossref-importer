if (!process.env.DATA_SOURCE) {
  console.log('You must provide DATA_SOURCE file.');
  process.exit(1);
}

if (!process.env.DYNAMO_REGION) {
  console.log('You must provide DYNAMO_REGION.');
  process.exit(1);
}

if (!process.env.DYNAMO_TABLE_NAME) {
  console.log('You must provide DYNAMO_REGION.');
  process.exit(1);
}

var fs = require('fs');
var es = require('event-stream');
var dynamoLib = require('./lib');

var DATA_SOURCE = process.env.DATA_SOURCE || 'crossref-dump.tsv';

/**
 * Runs the import
 * 1) reads tsv content
 * 2) groups in batches of 25
 * 3) runs batch inserts
 */
function processInputData() {
 var lineNr = 0;
 var batch = [];
 var batchIndex = 0;

 var s = fs.createReadStream(__dirname + '/../' + DATA_SOURCE)
     .pipe(es.split('\n'))
     .pipe(es.mapSync(function(line){

         // pause the readstream
         s.pause();

         lineNr += 1;

         // process line here and call s.resume() when rdy
         var currentLine = line.split('\t');

         // var names indicate the direction of citation
         // "citeTo" article is cited by "citeFrom"
         var citeFrom = currentLine[0];
         var citeTo = currentLine[1];

         if (typeof citeFrom === 'string' && typeof citeTo === 'string') {
           batch.push(dynamoLib.createPutRequest(citeFrom, citeTo));
         }

         // if batch is large enough or there's nothing more to process - insert
         if (batch.length === 25 ) {
           batchIndex++;
           console.log('Processing batch #' + batchIndex);

            pushData(batch, function(err, data) {
              if (err) {
                console.error('Error occurred when processing batch #' + batchIndex + '. Stopping ingest.');
                console.error(err);
                console.log('Batch contents:', JSON.stringify(batch, null, 2));
              } else {
                // resume the readstream, possibly from a callback
                batch = [];
                s.resume();
              }
            });
         } else {
           s.resume();
         }

     })
     .on('error', function(err){
         console.log('Error while reading file.', err);
     })
     .on('end', function(){
         pushData(batch);
         console.log('Read entire file.')
     })
 );
}

function pushData(currBatch, callback) {
  if (currBatch.length) {
    dynamoLib.batchInsert(currBatch, function (err, data) {
      // console.log('insert err', err);
      // console.log('insert data', data);
      return callback(err, data);
    });
  } else {
    callback();
  }
}

processInputData();
