from pydantic import BaseModel
class Products(BaseModel):
    id: int
    EPC: str
    Product: str

