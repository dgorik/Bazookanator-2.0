import Perplexity from '@perplexity-ai/perplexity_ai'

export const perplexityClient = new Perplexity({
  apiKey: process.env['PERPLEXITY_API_KEY'], // This is the default and can be omitted
})
