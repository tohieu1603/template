import { Entity, PrimaryColumn } from 'typeorm';

@Entity('product_variant_attributes')
export class ProductVariantAttribute {
  @PrimaryColumn({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @PrimaryColumn({ name: 'attribute_value_id', type: 'uuid' })
  attributeValueId: string;
}
