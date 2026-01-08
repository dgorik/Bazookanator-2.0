import { Badge } from '@/src/components/ui/badge/badge'

export default function HeroSection() {
  return (
    <section id="herosection" className="container mx-auto p-4">
      <div className="grid place-items-center lg:max-w-screen-xl gap-8 mx-auto py-20 md:py-32">
        <div className="text-center space-y-4">
          <Badge
            variant="secondary"
            className=" shadow-inner bg-white border-2 rounded-2xl p-2"
          >
            <span className="mr-2 text-primary rounded-6xl">
              <Badge className="rounded-2xl">New</Badge>
            </span>
            <span> JD Mystery Gummy Cube is Out</span>
          </Badge>
          <div className="max-w-screen-md mx-auto text-center text-4xl md:text-6xl font-bold">
            <h1>
              Experience the
              <span className="text-transparent px-2 bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text">
                Bazookanator
              </span>
            </h1>
          </div>
          <p className="max-w-screen-md mx-auto text-lg text-muted-foreground">
            Visualize, analyse and derive insights from your financial data. One
            dollar at a time!
          </p>
        </div>
      </div>
    </section>
  )
}
