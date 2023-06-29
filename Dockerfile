FROM ccr.ccs.tencentyun.com/eqxiu/h2-devex-nginx-agent:1.0.0

WORKDIR /www

COPY process-env.sh .
RUN chmod 755 process-env.sh

COPY zip/ .

COPY h2yqxiu.conf /etc/nginx/conf.d/

COPY h2eqxiu.conf /etc/nginx/conf.d/

COPY MP_verify_ItPX8OoolpJT5DNP.txt .

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 修改时区
RUN apk add -U tzdata \
    && cp -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

EXPOSE 80

ENTRYPOINT /www/process-env.sh; /devex-nginx-agent /www > /etc/nginx/conf.d/default.conf; nginx -g "daemon off;"
