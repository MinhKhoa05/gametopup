# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY *.sln ./
COPY GameTopUp.DAL/*.csproj ./GameTopUp.DAL/
COPY GameTopUp.BLL/*.csproj ./GameTopUp.BLL/
COPY GameTopUp.API/*.csproj ./GameTopUp.API/

RUN dotnet restore GameTopUp.API/GameTopUp.API.csproj

COPY . .

RUN dotnet publish GameTopUp.API/GameTopUp.API.csproj -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "GameTopUp.API.dll"]