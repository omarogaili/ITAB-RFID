from pydantic import BaseModel
from typing import List
from Product import Products

class DataModel(BaseModel):
    detected_data: List
    percentage: float
    products: List[Products]

