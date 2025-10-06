import config from "@/config"

export const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function allowedOrigins() {
  const subdomains = ["student", "parent", "teacher", "admin"]
  const origins = config.CORS.allowedOrigins

  return [
    subdomains
      .map(subdomain => origins.map(origin => `http://${subdomain}.${origin}`))
      .flat(),
    ...origins.map(origin => `http://${origin}`),
  ].flat()
}
