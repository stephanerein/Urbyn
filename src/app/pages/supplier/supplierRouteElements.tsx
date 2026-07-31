import { useSupplierSession } from '../../contexts/SupplierSessionContext'
import { SupplierDashboard } from './SupplierDashboard'
import { CatalogStep } from './steps/CatalogStep'
import { ProductStep } from './steps/ProductStep'
import { ShippingPickStep } from './shipping/ShippingPickStep'
import { ShippingPricingStep } from './shipping/ShippingPricingStep'
import { ShippingZoneStep } from './shipping/ShippingZoneStep'
import { PaymentPickStep } from './payment/PaymentPickStep'
import { PaymentMethodStep } from './payment/PaymentMethodStep'
import { PaymentBankStep } from './payment/PaymentBankStep'

export function SupplierDashboardRoute() {
  return <SupplierDashboard session={useSupplierSession()} />
}

export function SupplierCatalogRoute() {
  return <CatalogStep session={useSupplierSession()} />
}

export function SupplierProductRoute() {
  return <ProductStep session={useSupplierSession()} />
}

export function SupplierShippingPickRoute() {
  return <ShippingPickStep session={useSupplierSession()} />
}

export function SupplierShippingZoneCreateRoute() {
  return <ShippingZoneStep session={useSupplierSession()} pathMode="creer" />
}

export function SupplierShippingZoneEditRoute() {
  return <ShippingZoneStep session={useSupplierSession()} pathMode="modifier" />
}

export function SupplierShippingPricingCreateRoute() {
  return <ShippingPricingStep session={useSupplierSession()} pathMode="creer" />
}

export function SupplierShippingPricingEditRoute() {
  return <ShippingPricingStep session={useSupplierSession()} pathMode="modifier" />
}

export function SupplierPaymentPickRoute() {
  return <PaymentPickStep session={useSupplierSession()} />
}

export function SupplierPaymentMethodCreateRoute() {
  return <PaymentMethodStep session={useSupplierSession()} pathMode="creer" />
}

export function SupplierPaymentMethodEditRoute() {
  return <PaymentMethodStep session={useSupplierSession()} pathMode="modifier" />
}

export function SupplierPaymentBankCreateRoute() {
  return <PaymentBankStep session={useSupplierSession()} pathMode="creer" />
}

export function SupplierPaymentBankEditRoute() {
  return <PaymentBankStep session={useSupplierSession()} pathMode="modifier" />
}
