# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY GameTopUp.slnx ./
COPY GameTopUp.Api/*.csproj ./GameTopUp.Api/
COPY GameTopUp.BLL/*.csproj ./GameTopUp.BLL/
COPY GameTopUp.DAL/*.csproj ./GameTopUp.DAL/

RUN dotnet restore GameTopUp.Api/GameTopUp.Api.csproj

COPY . .

RUN dotnet publish GameTopUp.Api/GameTopUp.Api.csproj -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "GameTopUp.Api.dll"]
