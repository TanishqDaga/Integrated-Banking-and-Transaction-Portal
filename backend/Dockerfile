# ==========================
# Stage 1: Build the project
# ==========================
FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# ==========================
# Stage 2: Run the application
# ==========================
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=builder /app/target/Banking-app-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENV DATA_SOURCE_URL=jdbc:mysql://mysql:3306/banking_app
ENV DATA_SOURCE_USERNAME=root
ENV DATA_SOURCE_PASSWORD=password

ENTRYPOINT ["java","-jar","app.jar"]