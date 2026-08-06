# Build stage
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Create non-root user for security
RUN groupadd --system archives && useradd --system --gid archives --create-home archives && mkdir -p /app/uploads && chown -R archives:archives /app

# Copy JAR from build stage
COPY --from=build --chown=archives:archives /app/target/*.jar app.jar

USER archives:archives

# Expose port
EXPOSE 8080

# JVM options for container
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
