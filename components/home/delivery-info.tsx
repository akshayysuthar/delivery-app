import { Truck, Clock, MapPin } from "lucide-react"
import { siteConfig } from "@/config/site"

export function DeliveryInfo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center space-x-3 p-2">
        <div className="bg-primary/10 p-2 rounded-full">
          <Truck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">Fast Delivery</h3>
          <p className="text-sm text-muted-foreground">Get your groceries in {siteConfig.deliveryTime}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 p-2">
        <div className="bg-primary/10 p-2 rounded-full">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">Open 24/7</h3>
          <p className="text-sm text-muted-foreground">Order anytime, day or night</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 p-2">
        <div className="bg-primary/10 p-2 rounded-full">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">Serving Surat</h3>
          <p className="text-sm text-muted-foreground">Available in {siteConfig.deliveryAreas.length} areas</p>
        </div>
      </div>
    </div>
  )
}

