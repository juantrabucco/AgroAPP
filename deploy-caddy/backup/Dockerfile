FROM alpine:3.19
RUN apk add --no-cache bash tzdata postgresql-client curl ca-certificates  && adduser -D backup
USER backup
WORKDIR /home/backup

# MinIO client (mc)
RUN curl -fsSL https://dl.min.io/client/mc/release/linux-amd64/mc -o mc && chmod +x mc

COPY run.sh /home/backup/run.sh
COPY crontab /home/backup/crontab
ENV CRON_SCHEDULE="30 2 * * *"     RETENTION_DAYS=14

CMD ["bash", "-lc", "crontab /home/backup/crontab && crond -f -l 2"]
