import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import PaymentButton from "./PaymentButton";

const sampleProduct = {
  _id: "afb3egdfshdg", // Use the RAZORPAY_KEY_ID like -> "rzp_test_1DP5mmOlF5G5ag"
  image:
    "https://images.unsplash.com/photo-1779825457817-421102045350?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  title: "test_title",
  description: "test_description",
  price: {
    amount: 100000,
    currency: "INR",
  },
};

const resolveProductImage = (image) => {
  if (typeof image !== "string" || !image.trim()) {
    return sampleProduct.image;
  }

  try {
    const imageUrl = new URL(image, window.location.origin);
    const isLocalHost = ["localhost", "127.0.0.1", "[::1]"].includes(
      imageUrl.hostname,
    );

    if (isLocalHost && imageUrl.origin !== window.location.origin) {
      return sampleProduct.image;
    }

    if (!["http:", "https:"].includes(imageUrl.protocol)) {
      return sampleProduct.image;
    }

    if (window.location.protocol === "https:" && imageUrl.protocol !== "https:") {
      return sampleProduct.image;
    }

    return imageUrl.href;
  } catch {
    return sampleProduct.image;
  }
};

const formatPrice = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8h14l1 13H4L5 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

const App = () => {
  const [product, setProduct] = useState(sampleProduct);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [apiError, setApiError] = useState("");
  const [message, setMessage] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let active = true;

    axios
      .get("http://localhost:3000/api/products/get-item")
      .then((response) => {
        if (!active) return;
        const result = response.data?.product;
        const fetchedProduct = Array.isArray(result) ? result[0] : result;
        if (fetchedProduct) setProduct(fetchedProduct);
      })
      .catch(() => {
        if (active) {
          setApiError(
            "Showing a sample product — the product service is unavailable.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const addToCart = () => {
    setCartQuantity((quantity) => quantity + 1);
    setMessage(`${product.title} added to your bag.`);
  };

  const updateQuantity = (change) => {
    setCartQuantity((quantity) => Math.max(0, quantity + change));
    setMessage("");
  };

  const price = product.price?.amount ?? 0;
  const currency = product.price?.currency ?? "INR";
  const subtotal = price * cartQuantity;
  const productImage = imageFailed
    ? sampleProduct.image
    : resolveProductImage(product.image);

  return (
    <main className="storefront">
      <header className="topbar">
        <a className="wordmark" href="#" aria-label="Forma home">
          forma<span>.</span>
        </a>
        <p className="topbar-note">Objects made to last.</p>
        <a
          className="bag-link"
          href="#your-bag"
          aria-label={`Your bag, ${cartQuantity} items`}
        >
          <BagIcon />
          <span>Bag</span>
          <span className="bag-count">{cartQuantity}</span>
        </a>
      </header>

      <section className="shop-layout">
        <div className="product-column">
          <div className="eyebrow">
            <span className="eyebrow-line" /> THE EVERYDAY EDIT
          </div>
          <div className="product-heading">
            <div>
              <p className="collection-label">
                FORM NO. 01&nbsp; / &nbsp;OBJECTS
              </p>
              <h1>{product.title}</h1>
            </div>
            <span className="product-index">01 — 04</span>
          </div>

          <div className="product-image-wrap">
            <img
              className="product-image"
              src={productImage}
              alt={product.title}
              onError={() => setImageFailed(true)}
            />
            <span className="image-tag">A considered essential</span>
            <span className="image-number">01 / 04</span>
          </div>

          <div className="product-info">
            <div className="description-block">
              <p className="section-label">A LITTLE ABOUT IT</p>
              <p className="description">{product.description}</p>
            </div>
            <div className="price-block">
              <p className="section-label">YOUR INVESTMENT</p>
              <p className="price">{formatPrice(price, currency)}</p>
              <p className="tax-note">Inclusive of all taxes</p>
            </div>
          </div>
        </div>

        <aside className="cart-panel" id="your-bag">
          <div className="cart-panel-header">
            <div>
              <p className="section-label">YOUR SELECTION</p>
              <h2>
                Your bag<span>.</span>
              </h2>
            </div>
            <span className="cart-panel-count">
              {String(cartQuantity).padStart(2, "0")}
            </span>
          </div>

          {cartQuantity > 0 ? (
            <div className="cart-item">
              <img
                src={productImage}
                alt=""
                onError={() => setImageFailed(true)}
              />
              <div className="cart-item-details">
                <p className="cart-item-name">{product.title}</p>
                <p className="cart-item-price">
                  {formatPrice(price, currency)}
                </p>
                <div className="quantity-control" aria-label="Quantity">
                  <button
                    onClick={() => updateQuantity(-1)}
                    aria-label="Remove one"
                  >
                    −
                  </button>
                  <span>{cartQuantity}</span>
                  <button
                    onClick={() => updateQuantity(1)}
                    aria-label="Add one"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                className="remove-button"
                onClick={() => {
                  setCartQuantity(0);
                  setMessage("");
                }}
                aria-label="Remove item from bag"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="empty-bag">
              <div className="empty-bag-icon">
                <BagIcon />
              </div>
              <p>Your bag is taking it slow.</p>
              <span>Add something you love to get started.</span>
            </div>
          )}

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>
            <div className="summary-row shipping-row">
              <span>Shipping</span>
              <span>Complimentary</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>
          </div>

          <button className="buy-button" onClick={addToCart}>
            <span>{cartQuantity ? "Add another" : "Buy now"}</span>
            <ArrowIcon />
          </button>
          <PaymentButton />
          {message && (
            <p className="cart-message" role="status">
              {message}
            </p>
          )}
          <p className="secure-note">
            <span /> Secure checkout&nbsp; · &nbsp;Easy returns
          </p>
          {apiError && (
            <p className="api-note" role="status">
              {apiError}
            </p>
          )}
        </aside>
      </section>

      <footer className="page-footer">
        <span>MADE WITH INTENTION</span>
        <span>GOOD THINGS, KEPT SIMPLE.</span>
        <span>© FORMA STUDIO 2025</span>
      </footer>
    </main>
  );
};

export default App;
