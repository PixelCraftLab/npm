export class ByteCraftError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ByteCraftError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BufferBoundsError extends ByteCraftError {
  constructor(offset: number, requested: number, total: number) {
    super(
      `Out of bounds read/write: offset ${offset} + requested ${requested} exceeds capacity of ${total} bytes.`,
      "ERR_OUT_OF_BOUNDS"
    );
    this.name = "BufferBoundsError";
  }
}

export class EncodingError extends ByteCraftError {
  constructor(reason: string) {
    super(`Encoding or decoding failed: ${reason}`, "ERR_ENCODING");
    this.name = "EncodingError";
  }
}
