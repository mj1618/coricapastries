// Generated from the live coricapastries.com.au catalogue on 2026-09-18.
// Prices and descriptions are as published there; edit here to update the site.

export type Variant = { label: string; price: number }
export type Product = {
  slug: string
  name: string
  image: string
  description: string
  note: string
  priceFrom: number | null
  priceTo: number | null
  optionLabel: string | null
  variants: Variant[]
}
export type Category = { slug: string; name: string; products: Product[] }

export const catalogue: Category[] = [
  {
    "slug": "strudels",
    "name": "Strudels",
    "products": [
      {
        "slug": "apple-strudel",
        "name": "Apple Strudel",
        "image": "/img/products/apple-strudel.jpg",
        "description": "Corica's world famous strudel consists of layers of flaky puff pastry, Italian custard, fresh apple and fresh cream.",
        "note": "Please be advised that our products may contain traces of nuts but is halal. In doubt, please contact us.",
        "priceFrom": 23.0,
        "priceTo": 33.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Half (3-4 serves)",
            "price": 23
          },
          {
            "label": "Full (6-8 serves)",
            "price": 33
          }
        ]
      },
      {
        "slug": "blueberry-apple-strudel",
        "name": "Blueberry & Apple Strudel",
        "image": "/img/products/blueberry-apple-strudel.jpg",
        "description": "Corica's world famous blueberry and apple strudel consists of layers of flaky puff pastry, Italian custard, fresh apple & blueberries and fresh cream. Half size also available.",
        "note": "Please be advised that our products may contain traces of nuts but is halal. In doubt, please contact us.",
        "priceFrom": 23.0,
        "priceTo": 33.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Half (3-4 serves)",
            "price": 23
          },
          {
            "label": "Full (6-8 serves)",
            "price": 33
          }
        ]
      }
    ]
  },
  {
    "slug": "birthday-cakes",
    "name": "Birthday Cakes",
    "products": [
      {
        "slug": "black-forrest-torta",
        "name": "Black Forrest Torta",
        "image": "/img/products/black-forrest-torta.jpg",
        "description": "Consists of chocolate sponge, fresh cream, maraschino cherries and liqueur.",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 55.0,
        "priceTo": 215.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Small (serves 10-12)",
            "price": 55
          },
          {
            "label": "Medium (serves 20-25)",
            "price": 85
          },
          {
            "label": "Large (serves 30-35)",
            "price": 110
          },
          {
            "label": "1 Sec (serves 40-50)",
            "price": 160
          },
          {
            "label": "2 Sec (serves 70-80)",
            "price": 215
          }
        ]
      },
      {
        "slug": "chocolate-ganache",
        "name": "Chocolate Ganache",
        "image": "/img/products/chocolate-ganache.jpg",
        "description": "Chocolate Sponge with layers of Chocolate Custard, Buttercream and Liqueur, covered in Decadent Ganache!",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 55.0,
        "priceTo": 215.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Small (serves 10-12)",
            "price": 55
          },
          {
            "label": "Medium (serves 20-25)",
            "price": 85
          },
          {
            "label": "Large (serves 30-35)",
            "price": 110
          },
          {
            "label": "1 Sec (serves 40-50)",
            "price": 160
          },
          {
            "label": "2 Sec (serves 70-80)",
            "price": 215
          }
        ]
      },
      {
        "slug": "continental-torta",
        "name": "Continental Torta",
        "image": "/img/products/continental-torta.jpg",
        "description": "Consists of vanilla sponge, vanilla custard, mocha buttercream and liqueur. Available in small, medium and large.",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 55.0,
        "priceTo": 215.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Small (serves 10-12)",
            "price": 55
          },
          {
            "label": "Medium (serves 20-25)",
            "price": 85
          },
          {
            "label": "Large (serves 30-35)",
            "price": 110
          },
          {
            "label": "1 Sec (serves 40-50)",
            "price": 160
          },
          {
            "label": "2 Sec (serves 70-80)",
            "price": 215
          }
        ]
      },
      {
        "slug": "hazelnut-torta",
        "name": "Hazelnut Torta",
        "image": "/img/products/hazelnut-torta.jpg",
        "description": "Consists of chocolate sponge, hazelnut custard, mocha buttercream and liqueur.",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 55.0,
        "priceTo": 215.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Small (serves 10-12)",
            "price": 55
          },
          {
            "label": "Medium (serves 20-25)",
            "price": 85
          },
          {
            "label": "Large (serves 30-35)",
            "price": 110
          },
          {
            "label": "1 Sec (serves 40-50)",
            "price": 160
          },
          {
            "label": "2 Sec (serves 70-80)",
            "price": 215
          }
        ]
      },
      {
        "slug": "heart-torta",
        "name": "Heart Torta",
        "image": "/img/products/heart-torta.jpg",
        "description": "One of our beautiful Tortas in a Love Heart shape!",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 95.0,
        "priceTo": 115.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Small (serves 20-25)",
            "price": 95
          },
          {
            "label": "Large (serves 30-35)",
            "price": 115
          }
        ]
      },
      {
        "slug": "key",
        "name": "Key",
        "image": "/img/products/key.jpg",
        "description": "One of our delicious Tortas in the shape of a Key, perfect for a 21st or House Warmings! Serves approx 40-45 people.",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 165.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "rum-torta",
        "name": "Rum Torta",
        "image": "/img/products/rum-torta.jpg",
        "description": "Consists of chocolate sponge, vanilla custard, mocha buttercream and rum.",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 55.0,
        "priceTo": 215.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Small (serves 10-12)",
            "price": 55
          },
          {
            "label": "Medium (serves 20-25)",
            "price": 85
          },
          {
            "label": "Large (serves 30-35)",
            "price": 110
          },
          {
            "label": "1 Sec (serves 40-50)",
            "price": 160
          },
          {
            "label": "2 Sec (serves 70-80)",
            "price": 215
          }
        ]
      },
      {
        "slug": "st-honore",
        "name": "St Honore",
        "image": "/img/products/st-honore.jpg",
        "description": "",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 85.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      }
    ]
  },
  {
    "slug": "special-occasions",
    "name": "Special Occasions",
    "products": [
      {
        "slug": "baked-ricotta-cheesecake",
        "name": "Baked Ricotta Cheesecake",
        "image": "/img/products/baked-ricotta-cheesecake.jpg",
        "description": "Our Beautiful Baked Ricotta Cheesecake with sultanas, ricotta and a hint of lemon zest!",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 26.0,
        "priceTo": 36.5,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Half (serves 5)",
            "price": 26
          },
          {
            "label": "Full (serves 10)",
            "price": 36.5
          }
        ]
      },
      {
        "slug": "blueberry-cheesecake",
        "name": "Blueberry Cheesecake",
        "image": "/img/products/blueberry-cheesecake.jpg",
        "description": "",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 45.0,
        "priceTo": 55.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Small",
            "price": 45
          },
          {
            "label": "Large",
            "price": 55
          }
        ]
      },
      {
        "slug": "chocolate-cheesecake",
        "name": "Chocolate Cheesecake",
        "image": "/img/products/chocolate-cheesecake.jpg",
        "description": "",
        "note": "Please be advised that this products may contain traces of nuts.",
        "priceFrom": 45.0,
        "priceTo": 55.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Small",
            "price": 45
          },
          {
            "label": "Large",
            "price": 55
          }
        ]
      },
      {
        "slug": "coffee-cheesecake",
        "name": "Coffee Cheesecake",
        "image": "/img/products/coffee-cheesecake.jpg",
        "description": "",
        "note": "Please be advised that this product may contain traces of nuts.",
        "priceFrom": 45.0,
        "priceTo": 55.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Small",
            "price": 45
          },
          {
            "label": "Large",
            "price": 55
          }
        ]
      },
      {
        "slug": "croque-em-bouche",
        "name": "Croque Em Bouche",
        "image": "/img/products/croque-em-bouche.jpg",
        "description": "A spectacular tower of custard filled profiteroles coated in either Toffee or Chocolate. Made by the dozen, starting at 2 dozen. All prices include decorating with A Message Plaque and Fresh Cream with either Glace Cherries, Sugar Roses or Chocolate pieces.",
        "note": "Please be advised that this product may contain traces of nuts.",
        "priceFrom": 120.0,
        "priceTo": 335.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "2 dozen",
            "price": 120
          },
          {
            "label": "3 dozen",
            "price": 175
          },
          {
            "label": "4 dozen",
            "price": 225
          },
          {
            "label": "5 dozen",
            "price": 280
          },
          {
            "label": "6 dozen",
            "price": 335
          }
        ]
      },
      {
        "slug": "easter-bunny",
        "name": "Easter Bunny",
        "image": "/img/products/easter-bunny.jpg",
        "description": "Celebrate Easter with your own Easter Bunny! Available in 2 flavours.",
        "note": "",
        "priceFrom": 40.0,
        "priceTo": null,
        "optionLabel": "Flavour",
        "variants": [
          {
            "label": "Traditional",
            "price": 40
          },
          {
            "label": "Black Forrest",
            "price": 40
          }
        ]
      },
      {
        "slug": "fruit-flan",
        "name": "Fruit Flan",
        "image": "/img/products/fruit-flan.jpg",
        "description": "Serves 8-10",
        "note": "Please be advised that this product may contain traces of nuts.",
        "priceFrom": 60.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "honey-cake-log",
        "name": "Honey Cake Log",
        "image": "/img/products/honey-cake-log.jpg",
        "description": "A log that feeds approx. 6ppl consisting of layers of spiced honey sponge with decadent caramel.",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 36.5,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "honey-cake-round",
        "name": "Honey Cake Round",
        "image": "/img/products/honey-cake-round.jpg",
        "description": "A round cake that feeds approx. 12ppl consisting of layers of spiced honey sponge with decadent caramel.",
        "note": "Please note that in order to maintain the quality of this product, we kindly request a 48-hour notice when placing an order. Thank you for your understanding.",
        "priceFrom": 55.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "mixed-fruit-cheesecake",
        "name": "Mixed Fruit Cheesecake",
        "image": "/img/products/mixed-fruit-cheesecake.jpg",
        "description": "",
        "note": "Please be advised that this product may contain traces of nuts.",
        "priceFrom": 45.0,
        "priceTo": 55.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Small",
            "price": 45
          },
          {
            "label": "Large",
            "price": 55
          }
        ]
      },
      {
        "slug": "passionfruit-cheesecake",
        "name": "Passionfruit Cheesecake",
        "image": "/img/products/passionfruit-cheesecake.jpg",
        "description": "",
        "note": "Please be advised that this product may contain traces of nuts.",
        "priceFrom": 45.0,
        "priceTo": 55.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Small",
            "price": 45
          },
          {
            "label": "Large",
            "price": 55
          }
        ]
      },
      {
        "slug": "strawberry-cheesecake",
        "name": "Strawberry Cheesecake",
        "image": "/img/products/strawberry-cheesecake.jpg",
        "description": "",
        "note": "Please be advised that this product may contain traces of nuts.",
        "priceFrom": 45.0,
        "priceTo": 55.0,
        "optionLabel": "Size",
        "variants": [
          {
            "label": "Small",
            "price": 45
          },
          {
            "label": "Large",
            "price": 55
          }
        ]
      }
    ]
  },
  {
    "slug": "mini-range",
    "name": "Mini Range",
    "products": [
      {
        "slug": "mini-eclair",
        "name": "Mini Eclair",
        "image": "/img/products/mini-eclair.jpg",
        "description": "Made of Corica's own delicious choux pastry coated with white chocolate and filled with Chantilly cream or custard.",
        "note": "Please note that in order to maintain the quality of this product, we kindly request a 72-hour notice when placing an order. Thank you for your understanding.",
        "priceFrom": 4.0,
        "priceTo": null,
        "optionLabel": "Filling",
        "variants": [
          {
            "label": "Vanilla Custard",
            "price": 4
          },
          {
            "label": "Chantilly Filling",
            "price": 4
          }
        ]
      },
      {
        "slug": "mini-fruit-flan",
        "name": "Mini Fruit Flan",
        "image": "/img/products/mini-fruit-flan.jpg",
        "description": "A bite sized treat consisting of a shortbread base filled with vanilla custard and topped with fresh fruit.",
        "note": "Please be advised that our products may contain traces of nuts. In doubt, please contact us.",
        "priceFrom": 4.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "mini-heart-strudel",
        "name": "Mini Heart Strudel",
        "image": "/img/products/mini-heart-strudel.jpg",
        "description": "A bite size serve of our famous apple strudel in the cutest little heart shape!",
        "note": "",
        "priceFrom": 5.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "mini-maid-of-honour",
        "name": "Mini Maid of Honour",
        "image": "/img/products/mini-maid-of-honour.jpg",
        "description": "Consists of a shortbread base with raspberry jam, an almond filling and flaked almonds.",
        "note": "Please be advised that this product contains nuts.",
        "priceFrom": 5.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "mini-profiterole",
        "name": "Mini Profiterole",
        "image": "/img/products/mini-profiterole.jpg",
        "description": "Bite sized profiteroles filled with a light Chantilly cream, suitable for any cocktail or canapé functions. This product must be ordered in advance to avoid disappointment!",
        "note": "Please note that in order to maintain the quality of this product, we kindly request a 72-hour notice when placing an order. Thank you for your understanding.",
        "priceFrom": 4.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "mini-sicilian-cannoli",
        "name": "Mini Sicilian Cannoli",
        "image": "/img/products/mini-sicilian-cannoli.jpg",
        "description": "Your favourite italian product in a small bite sized piece! Choice of filling provided.",
        "note": "Please be advised that our products may contain traces of nuts and liqueur. In doubt, please contact us.",
        "priceFrom": 5.0,
        "priceTo": null,
        "optionLabel": "Filling",
        "variants": [
          {
            "label": "Vanilla Custard",
            "price": 5
          },
          {
            "label": "Half Choc & Vanilla",
            "price": 5
          },
          {
            "label": "Chocolate Custard",
            "price": 5
          },
          {
            "label": "Hazelnut Custard",
            "price": 5
          },
          {
            "label": "Ricotta",
            "price": 5
          },
          {
            "label": "Pistachio",
            "price": 5
          }
        ]
      }
    ]
  },
  {
    "slug": "small-pastries",
    "name": "Small Pastries",
    "products": [
      {
        "slug": "almond-slice",
        "name": "Almond Slice",
        "image": "/img/products/almond-slice.jpg",
        "description": "Made of Corica's own biscuit base topped with caramel and almond.",
        "note": "Please be advised that this product contains nuts.",
        "priceFrom": 5.5,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "amore",
        "name": "Amore",
        "image": "/img/products/amore.jpg",
        "description": "You will certainly enjoy the mouth-watering taste of layers of shortbread biscuit, filled with buttercream and apricot jam, and decorated with apricot jam and almond.",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 5.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "baked-ricotta-slice",
        "name": "Baked Ricotta Slice",
        "image": "/img/products/baked-ricotta-slice.jpg",
        "description": "A slice of our delicious baked ricotta cheesecake.",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 6.2,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "blueberry-tart",
        "name": "Blueberry Tart",
        "image": "/img/products/blueberry-tart.jpg",
        "description": "Made of Corica's own delicious shortbread, blueberry gel and blueberries.",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 5.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "carrot-cake",
        "name": "Carrot Cake",
        "image": "/img/products/carrot-cake.jpg",
        "description": "Made of delicious carrots, wholemeal flour and walnuts, topped with cream cheese.",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 6.2,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "cheesecake-slice-blueberry",
        "name": "Cheesecake Slice – Blueberry",
        "image": "/img/products/cheesecake-slice-blueberry.jpg",
        "description": "",
        "note": "Please be advised that our products may contain traces of nuts. In doubt, please contact us.",
        "priceFrom": 5.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "cheesecake-slice-chocolate",
        "name": "Cheesecake Slice – Chocolate",
        "image": "/img/products/cheesecake-slice-chocolate.jpg",
        "description": "",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 5.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "cheesecake-slice-espresso",
        "name": "Cheesecake Slice – Espresso",
        "image": "/img/products/cheesecake-slice-espresso.jpg",
        "description": "",
        "note": "Please be advised that this product may contain traces of nuts.",
        "priceFrom": 5.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "cheesecake-slice-passionfruit",
        "name": "Cheesecake Slice – Passionfruit",
        "image": "/img/products/cheesecake-slice-passionfruit.jpg",
        "description": "",
        "note": "Please be advised that this product may contain traces of nuts.",
        "priceFrom": 5.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "cheesecake-slice-strawberry",
        "name": "Cheesecake Slice – Strawberry",
        "image": "/img/products/cheesecake-slice-strawberry.jpg",
        "description": "",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 5.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "cheesecake-slice-white-chocolate",
        "name": "Cheesecake Slice – White Chocolate",
        "image": "/img/products/cheesecake-slice-white-chocolate.jpg",
        "description": "",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 5.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "chocolate-horn",
        "name": "Chocolate Horn",
        "image": "/img/products/chocolate-horn.jpg",
        "description": "Made of Corica's own delicious glazed puff pastry topped with chocolate and filled with our traditional Italian custard.",
        "note": "Please be advised that our products may contain traces of nuts, liqueur etc. In doubt, please contact us.",
        "priceFrom": 5.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      }
    ]
  },
  {
    "slug": "biscuits",
    "name": "Biscuits",
    "products": [
      {
        "slug": "cantucci",
        "name": "Cantucci",
        "image": "/img/products/cantucci.jpg",
        "description": "Delicious & traditional double baked italian biscuits made with almonds. * Thin pictured",
        "note": "Please be advised that this product contains nuts.",
        "priceFrom": 16.5,
        "priceTo": null,
        "optionLabel": "Thickness",
        "variants": [
          {
            "label": "Thick",
            "price": 16.5
          },
          {
            "label": "Thin",
            "price": 16.5
          }
        ]
      },
      {
        "slug": "cats-tongue",
        "name": "Cats Tongue",
        "image": "/img/products/cats-tongue.jpg",
        "description": "Deliciously thin Italian biscuits with a hint of lemon! 200g packet.",
        "note": "Please be advised that our products may contain traces of nuts. In doubt, please contact us.",
        "priceFrom": 15.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "cheese-biscuit",
        "name": "Cheese Biscuit",
        "image": "/img/products/cheese-biscuit.jpg",
        "description": "Scrumptious Cheese Biscuits perfect for a morning tea! We're warning you now, they are very moreish! 200g Packet.",
        "note": "Please note that in order to maintain the quality of this product, we kindly request a 48-hour notice when placing an order. Thank you for your understanding.",
        "priceFrom": 15.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "cornflake-cookies",
        "name": "Cornflake Cookies",
        "image": "/img/products/cornflake-cookies.jpg",
        "description": "10 scrumptious Cookies bursting with sultanas, raisons and cornflakes!",
        "note": "Please be advised that this product may contain traces of nuts.",
        "priceFrom": 15.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "fans",
        "name": "Fans",
        "image": "/img/products/fans.jpg",
        "description": "Meet our Palmiers little sister! Made of our famous puff pastry finessed into bite sized deliciously flaky and crunchy biscuits. Packet usually contains 14-16 pieces depending on size.",
        "note": "Please be advised that this product may contain traces of nuts.",
        "priceFrom": 15.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "meringue-biscuits",
        "name": "Meringue Biscuits",
        "image": "/img/products/meringue-biscuits.jpg",
        "description": "Light, crunchy and chewy meringue with chocolate drops and almond pieces. 200g Packet.",
        "note": "Please note that in order to maintain the quality of this product, we kindly request a 72-hour notice when placing an order. Thank you for your understanding.",
        "priceFrom": 18.5,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "mixed-shortbread",
        "name": "Mixed Shortbread",
        "image": "/img/products/mixed-shortbread.jpg",
        "description": "Corica Pastries own famous vanilla and chocolate shortbread biscuits with various toppings! 500g Packet.",
        "note": "Please be advised that our products may contain traces of nuts and liqueur. In doubt, please contact us.",
        "priceFrom": 24.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "palmier",
        "name": "Palmier",
        "image": "/img/products/palmier.jpg",
        "description": "Our famous puff pastry finessed into deliciously flaky and crunchy biscuits. Packet of 6-8 depending on size.",
        "note": "Please be advised that our products may contain traces of nuts and liqueur. In doubt, please contact us.",
        "priceFrom": 15.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "paste-secche",
        "name": "Paste Secche",
        "image": "/img/products/paste-secche.jpg",
        "description": "Our traditional Italian chewy and crunchy almond biscotti with various toppings. Dairy Free and Gluten Free!",
        "note": "",
        "priceFrom": 15.0,
        "priceTo": 60.0,
        "optionLabel": "Amount",
        "variants": [
          {
            "label": "250g",
            "price": 15
          },
          {
            "label": "500g",
            "price": 30
          },
          {
            "label": "1kg",
            "price": 60
          }
        ]
      }
    ]
  },
  {
    "slug": "gluten-free",
    "name": "Gluten Free Range",
    "products": [
      {
        "slug": "gf-blueberry-tart",
        "name": "GF Blueberry Tart",
        "image": "/img/products/gf-blueberry-tart.jpg",
        "description": "A delicious Gluten Free Tart consisting of a GF shortbread base with a blueberry and almond mixture and glazed with apricot jam.",
        "note": "Please note that in order to maintain the quality of this product, we kindly request a 48-hour notice when placing an order. Thank you for your understanding.",
        "priceFrom": 41.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "gf-choc-orange-and-almond-loaf",
        "name": "GF Choc, Orange and Almond Loaf",
        "image": "/img/products/gf-choc-orange-and-almond-loaf.jpg",
        "description": "A delicious Gluten Free loaf that feeds approx 4-6ppl made with gluten free flour, almonds, mixed peal and ganache!",
        "note": "Please note that in order to maintain the quality of this product, we kindly request a 48-hour notice when placing an order. Thank you for your understanding.",
        "priceFrom": 23.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "gf-pear-tart",
        "name": "GF Pear Tart",
        "image": "/img/products/gf-pear-tart.jpg",
        "description": "A delicious Gluten Free Tart consisting of a GF shortbread base with a pear and almond mixture and glazed with apricot jam.",
        "note": "Please note that in order to maintain the quality of this product, we kindly request a 48-hour notice when placing an order. Thank you for your understanding.",
        "priceFrom": 41.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "gf-pear-coconut-and-almond-loaf",
        "name": "GF Pear, Coconut and Almond Loaf",
        "image": "/img/products/gf-pear-coconut-and-almond-loaf.jpg",
        "description": "A delicious Gluten Free loaf that feeds approx 4-6ppl made with gluten free flour, almonds, coconut, apricot and pear!",
        "note": "Please note that in order to maintain the quality of this product, we kindly request a 48-hour notice when placing an order. Thank you for your understanding.",
        "priceFrom": 23.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "paste-secche",
        "name": "Paste Secche",
        "image": "/img/products/paste-secche.jpg",
        "description": "Our traditional Italian chewy and crunchy almond biscotti with various toppings. Dairy Free and Gluten Free!",
        "note": "",
        "priceFrom": 15.0,
        "priceTo": 60.0,
        "optionLabel": "Amount",
        "variants": [
          {
            "label": "250g",
            "price": 15
          },
          {
            "label": "500g",
            "price": 30
          },
          {
            "label": "1kg",
            "price": 60
          }
        ]
      }
    ]
  },
  {
    "slug": "christmas",
    "name": "Christmas",
    "products": [
      {
        "slug": "fruit-mince-pies-mini",
        "name": "Fruit Mince Pies (Mini)",
        "image": "/img/products/fruit-mince-pies-mini.jpg",
        "description": "",
        "note": "",
        "priceFrom": 19.0,
        "priceTo": 29.0,
        "optionLabel": "Packaging",
        "variants": [
          {
            "label": "6 Tray",
            "price": 19
          },
          {
            "label": "12 Tray",
            "price": 29
          }
        ]
      },
      {
        "slug": "fruit-mince-pies-reg",
        "name": "Fruit Mince Pies (Reg)",
        "image": "/img/products/fruit-mince-pies-reg.jpg",
        "description": "Our Regular Fruit Mince Pies available in 3 different packet sizes!",
        "note": "Please be advised that our products may contain traces of nuts.",
        "priceFrom": 21.0,
        "priceTo": 36.0,
        "optionLabel": "Packaging",
        "variants": [
          {
            "label": "6 Tray",
            "price": 21
          },
          {
            "label": "12 Tray",
            "price": 36
          },
          {
            "label": "12 Wrap",
            "price": 36
          }
        ]
      },
      {
        "slug": "gingerbread",
        "name": "Gingerbread",
        "image": "/img/products/gingerbread.jpg",
        "description": "",
        "note": "Please be advised that our products may contain traces of nuts.",
        "priceFrom": 20.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "santa-s-sleigh-loaf",
        "name": "Santa's Sleigh Loaf",
        "image": "/img/products/santa-s-sleigh-loaf.jpg",
        "description": "It's almost too cute to eat! Santa's sleigh consists of a deliciously light vanilla sponge with raspberry jam and fresh cream.",
        "note": "",
        "priceFrom": 30.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "shortbread-tree",
        "name": "Shortbread Tree",
        "image": "/img/products/shortbread-tree.jpg",
        "description": "A beautiful yet delicious Christmas centrepiece or gift! Contains 20 of our famous shortbread biscuits.",
        "note": "",
        "priceFrom": 46.0,
        "priceTo": null,
        "optionLabel": null,
        "variants": []
      },
      {
        "slug": "swiss-roll-yules",
        "name": "Swiss Roll Yules",
        "image": "/img/products/swiss-roll-yules.jpg",
        "description": "Available in 2 flavours: Traditional (raspberry jam & buttercream) or Black Forrest!",
        "note": "",
        "priceFrom": 46.0,
        "priceTo": null,
        "optionLabel": "Flavour",
        "variants": [
          {
            "label": "Traditional",
            "price": 46
          },
          {
            "label": "Black Forrest",
            "price": 46
          }
        ]
      }
    ]
  }
]

/* -------------------------------------------------------------------------
   Presentation metadata for the eight ranges.

   `blurb` doubles as the one-line description on the /patisserie tiles and as
   the lede on each category page, so keep it to a single factual sentence
   drawn from the product descriptions above. `image` is the representative
   photo for the overview tile — chosen so the circular crop stays filled.
   ------------------------------------------------------------------------- */

export type CategoryMeta = {
  blurb: string
  image: string
  imageAlt: string
}

export const categoryMeta: Record<string, CategoryMeta> = {
  strudels: {
    blurb:
      'The world-famous apple strudel that made our name: layers of flaky puff pastry, Italian custard, fresh apple and fresh cream.',
    image: '/img/products/apple-strudel.jpg',
    imageAlt:
      'A Corica apple strudel, its flaky puff pastry layered with apple, custard and cream',
  },
  'birthday-cakes': {
    blurb:
      'Continental tortas of sponge, custard, buttercream and liqueur, in five sizes from ten serves up to eighty.',
    image: '/img/products/black-forrest-torta.jpg',
    imageAlt:
      'A Black Forrest torta finished with piped cream, chocolate flake and maraschino cherries',
  },
  'special-occasions': {
    blurb:
      'Cheesecakes, honey cakes, fruit flans and croquembouche towers for the occasions worth baking for.',
    image: '/img/products/mixed-fruit-cheesecake.jpg',
    imageAlt: 'A mixed fruit cheesecake topped with glazed seasonal fruit',
  },
  'mini-range': {
    blurb:
      'Our pastries in bite size — éclairs, profiteroles, cannoli and tarts, priced individually for platters and functions.',
    image: '/img/products/mini-sicilian-cannoli.jpg',
    imageAlt: 'Two mini Sicilian cannoli filled with custard',
  },
  'small-pastries': {
    blurb:
      'The single-serve counter: slices, tarts and pastries made fresh, from the almond slice to the chocolate horn.',
    image: '/img/products/amore.jpg',
    imageAlt:
      'Three Amore pastries, layers of shortbread biscuit filled with buttercream',
  },
  biscuits: {
    blurb:
      'Traditional Italian biscuits by the packet: cantucci, palmiers, meringues, shortbread and paste secche.',
    image: '/img/products/mixed-shortbread.jpg',
    imageAlt:
      'An assortment of Corica shortbread biscuits with jam, chocolate and glacé cherry toppings',
  },
  'gluten-free': {
    blurb:
      'Gluten free tarts and loaves made with almonds, alongside our dairy free and gluten free paste secche.',
    image: '/img/products/gf-pear-tart.jpg',
    imageAlt:
      'A gluten free pear and almond tart glazed and topped with sliced pear',
  },
  christmas: {
    blurb:
      'Our seasonal range — fruit mince pies, gingerbread, shortbread trees and yule logs. Please call to check availability.',
    image: '/img/products/gingerbread.jpg',
    imageAlt:
      'Iced gingerbread shapes: a gingerbread man, a star and a Christmas tree',
  },
}

/** The eight ranges in the order the owners present them. */
export const categorySlugs = catalogue.map((c) => c.slug)

export function getCategory(slug: string): Category | undefined {
  return catalogue.find((c) => c.slug === slug)
}

export function getCategoryMeta(slug: string): CategoryMeta {
  return (
    categoryMeta[slug] ?? {
      blurb: '',
      image: '/img/products/apple-strudel.jpg',
      imageAlt: 'A Corica pastry',
    }
  )
}

/** `$23` for whole dollars, `$36.50` otherwise. */
export function formatPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`
}

/** Turns "Half (3-4 serves)" into "Half (3–4 serves)". */
export function prettyLabel(label: string): string {
  return label.replace(/(\d)\s*-\s*(\d)/g, '$1–$2')
}
