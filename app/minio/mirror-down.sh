#!/bin/sh

while :
  do
    mc mirror s3/minio-test-replication minio/minio-test-replication
    sleep 60
done


mc alias set onprem-b

