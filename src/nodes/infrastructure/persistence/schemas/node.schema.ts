import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({
  collection: 'nodes',
  timestamps: true,
  versionKey: false,
})
export class Node {
  @Prop({
    required: true,
    trim: true,
    maxlength: 120,
  })
  name!: string;

  @Prop({
    type: Types.ObjectId,
    ref: Node.name,
    default: null,
    index: true,
  })
  parentId!: Types.ObjectId | null;

  @Prop({
    required: true,
    index: true,
  })
  path!: string;

  @Prop({
    required: true,
    min: 0,
    index: true,
  })
  depth!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export type NodeDocument = HydratedDocument<Node>;

export const NodeSchema = SchemaFactory.createForClass(Node);

NodeSchema.index({ path: 1 }, { unique: true });
