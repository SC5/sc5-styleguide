FROM sc5io/ubuntu:latest
ENV BINDHOST 0.0.0.0
ENV PORT 3000
ENV NODE_ENV production
ADD . /app
RUN cd /app && rm -rf node_modules && npm install
WORKDIR /app
CMD npm run demo
