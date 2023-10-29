-- Table to store product categories

CREATE TABLE
    categories (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(100)
    );

-- Table to store products

CREATE TABLE
    products (
        product_id SERIAL PRIMARY KEY,
        product_name VARCHAR(100),
        category_id INT,
        price DECIMAL(10, 2),
        stock_quantity INT,
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
    );

-- Table to store customers

CREATE TABLE
    customers (
        customer_id SERIAL PRIMARY KEY,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        email VARCHAR(100),
        phone_number VARCHAR(20)
    );

-- Table to store orders

CREATE TABLE
    orders (
        order_id SERIAL PRIMARY KEY,
        customer_id INT,
        order_date DATE,
        total_amount DECIMAL(10, 2),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );

-- Table to store order details

CREATE TABLE
    order_details (
        order_detail_id SERIAL PRIMARY KEY,
        order_id INT,
        product_id INT,
        quantity INT,
        subtotal DECIMAL(10, 2),
        FOREIGN KEY (order_id) REFERENCES orders(order_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    );

-- Table to store addresses

CREATE TABLE
    addresses (
        address_id SERIAL PRIMARY KEY,
        customer_id INT,
        street_address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(50),
        zip_code VARCHAR(20),
        country VARCHAR(100),
        is_default BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );

-- Table to store payments

CREATE TABLE
    payments (
        payment_id SERIAL PRIMARY KEY,
        order_id INT,
        payment_date DATE,
        payment_amount DECIMAL(10, 2),
        payment_method VARCHAR(50),
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
    );

-- Table to store reviews

CREATE TABLE
    product_reviews (
        review_id SERIAL PRIMARY KEY,
        product_id INT,
        customer_id INT,
        rating INT,
        review_text TEXT,
        review_date DATE,
        FOREIGN KEY (product_id) REFERENCES products(product_id),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );

-- Table to store shopping carts

CREATE TABLE
    shopping_carts (
        cart_id SERIAL PRIMARY KEY,
        customer_id INT,
        created_date TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );

-- Table to store items in shopping carts

CREATE TABLE
    cart_items (
        cart_item_id SERIAL PRIMARY KEY,
        cart_id INT,
        product_id INT,
        quantity INT,
        FOREIGN KEY (cart_id) REFERENCES shopping_carts(cart_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    );