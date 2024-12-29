
# docker build -t tienda .
# docker-compose -f docker-compose-prod.yml up

#ip addr show docker0
#4: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default 
#    link/ether 02:42:d7:bf:fc:8f brd ff:ff:ff:ff:ff:ff
#    inet 172.18.0.1/16 brd 172.18.255.255 scope global docker0
#       valid_lft forever preferred_lft forever

# Dockerfile
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

ENV IN=production
ENV USER_DB=root
ENV PASS=example
ENV SECRET_KEY="EsTa MisMa:i8775tyjk,"
ENV DB_HOST=172.18.0.1

# React ya construidos, construirlo previamente, si no es demasiado tiempo
COPY React-tienda/dist /usr/share/caddy/react-tienda

EXPOSE 8000
CMD [ "node", "tienda.js" ]