#FROM eclipse-temurin:21-jdk
#
#WORKDIR /app
#
#COPY target/*.jar app.jar
#
#EXPOSE 8084
#
#ENTRYPOINT ["java","-jar","app.jar"]

FROM maven:3.9.8-eclipse-temurin-21 AS build

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java","-jar","app.jar"]