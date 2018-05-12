# CrossRef Data Importer

## Data Dump script

### Execution
```
python citation_data_updater.py -d "2018-05-11" -o crossref-dump.tsv
```


## Importing Data Dump to DynamoDB

### Dependencies

Before running import you'll need to install dependencies.

```
cd dynamoimport
npm install
```

### Setup

You need to specify the following environment variables when running the import.

- `DYNAMO_TABLE_NAME`
- `DYNAMO_REGION`
- `DATA_SOURCE` (name of the file, i.e. `crossref-dump.tsv`)

You will also need to have your AWS keys specified in ~/.aws/credentials in order to connect to DynamoDB.

### Execution

**Example (Linux/Mac):**

```
DYNAMO_TABLE_NAME=citations-prod DYNAMO_REGION=eu-west-2 DATA_SOURCE=crossref-dump.tsv node dynamoimport/index.js
```

**Example (Windows):**

```
set DYNAMO_TABLE_NAME=citations-prod
set DYNAMO_REGION=eu-west-2
set DATA_SOURCE=crossref-dump.tsv
node dynamoimport/index.js
```
