import Perplexity from '@perplexity-ai/perplexity_ai'

export function perplexityClient() {
  return new Perplexity({
    apiKey: process.env.PERPLEXITY_API_KEY,
  })
}
