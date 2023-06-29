#!/bin/sh

######################################
# desc: 前端因为是静态页面，无法通过环境变量来区分配置，所以生成多环境页面，容器启动时根据环境变量选择使用那个构建结果
#       打包的zip文件必须以  xxx-$环境.zip 的形式命名，eg:  video-test.zip
# author: hesimincn@gmail.com
# version: 0.1.1
######################################

EQXIU_ENV="${SPRING_PROFILES}"

echo "process-env.sh: ****** current env: $EQXIU_ENV ******* "

ZIP_FILE="$PWD/`ls|grep "\-${EQXIU_ENV}.zip"`"

echo "process-env.sh: ****** current file: $ZIP_FILE ******* "

if [[ ! -f "${ZIP_FILE}" ]];then
   echo "process-env.sh: ****** file not found: ${ZIP_FILE} ******* "
   exit 500
fi

if [[ ! -f "/www/index.html" ]];then
    unzip ${ZIP_FILE} -d /www
fi
