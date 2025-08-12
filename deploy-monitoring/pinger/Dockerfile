FROM alpine:3.19
RUN apk add --no-cache bash curl jq tzdata
COPY run.sh /run.sh
ENV TARGET_WEB="" TARGET_API="" SLACK_WEBHOOK=""
CMD ["bash","-lc","while true; do /run.sh; sleep 60; done"]
