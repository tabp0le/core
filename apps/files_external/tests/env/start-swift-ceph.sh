#!/bin/bash
#
# ownCloud
#
# This script start a docker container to test the files_external tests
# against. It will also change the files_external config to use the docker
# container as testing environment. This is reverted in the stop step.W
#
# Set environment variable DEBUG to print config file
#
# @author Morris Jobke
# @author Robin McCorkell
# @copyright 2015 ownCloud

if ! command -v docker >/dev/null 2>&1; then
    echo "No docker executable found - skipped docker setup"
    exit 0;
fi

echo "Docker executable found - setup docker"

docker_image=xenopathic/ceph-keystone

echo "Fetch recent ${docker_image} docker image"
docker pull ${docker_image}

# retrieve current folder to place the config in the parent folder
thisFolder=`echo $0 | sed 's#env/start-swift-ceph\.sh##'`

if [ -z "$thisFolder" ]; then
    thisFolder="."
fi;

port=5001

user=test
pass=testing
tenant=testenant
region=testregion
service=testceph
endpointFolder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

container=`docker run -d \
    -e KEYSTONE_PUBLIC_PORT=${port} \
    -e KEYSTONE_ADMIN_USER=${user} \
    -e KEYSTONE_ADMIN_PASS=${pass} \
    -e KEYSTONE_ADMIN_TENANT=${tenant} \
    -e KEYSTONE_ENDPOINT_REGION=${region} \
    -e KEYSTONE_SERVICE=${service} \
    -e OSD_SIZE=300 \
    -v ${endpointFolder}/entrypoint.sh:/entrypoint.sh \
    --privileged \
    --entrypoint /entrypoint.sh ${docker_image}`

host=`docker inspect --format="{{.NetworkSettings.IPAddress}}" $container`


echo "${docker_image} container: $container"

# put container IDs into a file to drop them after the test run (keep in mind that multiple tests run in parallel on the same host)
echo $container >> $thisFolder/dockerContainerCeph.$EXECUTOR_NUMBER.swift

echo -n "Waiting for ceph initialization"
if ! "$thisFolder"/env/wait-for-connection ${host} 80 600; then
    echo "[ERROR] Waited 600 seconds, no response" >&2
    docker logs $container
    exit 1
fi
sleep 1

cat > $thisFolder/config.swift.php <<DELIM
<?php

return array(
    'run'=>true,
    'url'=>'http://$host:$port/v2.0',
    'user'=>'$user',
    'tenant'=>'$tenant',
    'password'=>'$pass',
    'service_name'=>'$service',
    'bucket'=>'swift',
    'region' => '$region',
);

DELIM

if [ -n "$DEBUG" ]; then
    cat $thisFolder/config.swift.php
    cat $thisFolder/dockerContainerCeph.$EXECUTOR_NUMBER.swift
fi
