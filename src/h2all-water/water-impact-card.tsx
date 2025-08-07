import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <div className="max-w-md mx-auto bg-white p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-black">
          H2<span className="text-blue-500">ALL</span> WATER
        </h1>
      </div>

      {/* Main Image Card */}
      <div className="relative rounded-2xl overflow-hidden">
        <Image
          src="/children-image.jpg"
          alt="Two smiling children with arms around each other"
          width={400}
          height={500}
          className="w-full h-auto object-cover"
        />
        
        {/* Overlay Text */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h2 className="text-white text-2xl font-bold leading-tight">
            Your water bottle just changed a life.
          </h2>
        </div>
      </div>

      {/* Impact Message */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-black leading-tight">
          Millions lack clean, safe water. Your bottle helps change that.
        </h3>
        
        <p className="text-gray-700 text-base">
          Your bottle gives 5¢ to fund a clean water well in Uganda.
        </p>
      </div>

      {/* Call to Action Button */}
      <Button 
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 text-lg rounded-xl"
        size="lg"
      >
        Claim My Bottle
      </Button>
    </div>
  )
}
