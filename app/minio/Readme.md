# Step 1: Prepare media disks and encrypt with LUKS

Find unformatted /dev: `fdisk -l`

Format with LUKS: `cryptsetup -y -v --type luks2 luksFormat /dev/sdb`

Create mapping: `cryptsetup luksOpen /dev/sdb media-b-1`

Verify: `cryptsetup -v status media-b-1`
`cryptsetup luksDump media-b-1`

Make filesystem: `mkfs.ext4 /dev/mapper/media-b-1`

Mount/Remount: ```

cryptsetup luksOpen /dev/sdb media-b-1

mkdir /mnt/media-b-1
mount /dev/mapper/media-b-1 /mnt/media-b-1
df -H
```


Find UUID for /dev: `blkid`


<!--
NOPE: We encrypt the whole media disks with LUKS. No need for extra complexity. The optimizer and backup server would also need access to the decryption keys.

# Step 1: Self-signed TLS certificate
Minio needs self-signed TLS certificates to enable encryption with client-provided keys.
Note that NIST curves P-384 and P-521 are not currently supported. This cer tis only used between the reverse proxy and minio, so this is just to get minio to accept client provided encryption keys.
Generate a keypair valid for 99 years with:

```
cd minio-certs/
openssl req -new -sha256 -newkey ec:<(openssl ecparam -name prime256v1) -days 36500 -nodes -x509 -keyout private.key -out public.crt -subj \"/C=AT/L=Vienna/O=onprem/CN=minio\" -->
```

# Step 2: Set up minio config to publish bucket events via mqtt

```
docker-compose run minio-config

# Setup mqtt
mc admin config set minio notify_mqtt:1 enable="on" broker="tcp://broker:1883" topic="minio" qos="2" keep_alive_interval="2s" queue_limit=300

# Set region
mc admin config set minio region name=local

# Create Buckets
mc mb --region local minio/uploads
mc mb --region local minio/media

mc admin service restart minio


# Setup host aliases

mc config host add onprem-b https://onprem-b.hzw.fxp.at $MINIO_ACCESS_KEY $MINIO_SECRET_KEY --api S3v4

mc config host add onprem-a https://onprem-a.hzw.fxp.at $MINIO_ACCESS_KEY $MINIO_SECRET_KEY --api S3v4


# Mirroring
(set quiet flag to prevent progess bar from spamming logs, still prints useful -> line)

mc mirror --quiet --watch --active-active onprem-b/media minio/media





# Troubleshooting

```
mc admin trace -v -a minio
```

then do a request.




-- problem w client provided encryption: optimizer needs access? yas also onprem b.
better to just encrypt the disk.
