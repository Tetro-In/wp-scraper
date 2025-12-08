'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Phone, MapPin, Calendar } from 'lucide-react'

interface SellerInfo {
  phoneNumber: string
  name: string | null
  city: string | null
  catalogueUrl?: string | null
  createdAt?: Date
  isActive?: boolean
}

interface SellerDetailsModalProps {
  seller: SellerInfo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SellerDetailsModal({ seller, open, onOpenChange }: SellerDetailsModalProps) {
  if (!seller) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{seller.name || 'Unknown Seller'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono">{seller.phoneNumber}</span>
          </div>

          {seller.city && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{seller.city}</span>
            </div>
          )}

          {seller.createdAt && (
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {new Date(seller.createdAt).toLocaleDateString()}</span>
            </div>
          )}

          {seller.isActive !== undefined && (
            <div className="flex items-center gap-3">
              <Badge variant={seller.isActive ? 'default' : 'secondary'}>
                {seller.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          )}

          {seller.catalogueUrl && (
            <div className="pt-2 border-t">
              <a
                href={seller.catalogueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Open Catalogue
              </a>
            </div>
          )}

          <div className="pt-2 border-t">
            <a
              href={`https://wa.me/${seller.phoneNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-600 hover:underline"
            >
              <Phone className="h-4 w-4" />
              Message on WhatsApp
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
