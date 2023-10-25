-- Table for Products

CREATE TABLE
    products (
        product_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        stock_quantity INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Table for Customers

CREATE TABLE
    customers (
        customer_id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone_number VARCHAR(15),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Table for Orders

CREATE TABLE
    orders (
        order_id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );

-- Table for Order Items (Associative table to link products to orders)

CREATE TABLE
    order_items (
        order_item_id SERIAL PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    );

-- Table for Reviews

CREATE TABLE
    product_reviews (
        review_id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        customer_id INT NOT NULL,
        rating INT NOT NULL,
        comment
            TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(product_id),
            FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );

-- Table for Categories

CREATE TABLE
    categories (
        category_id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        parent_category_id INT,
        FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
    );

-- Table for Addresses (for customers)

CREATE TABLE
    addresses (
        address_id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL,
        street_address VARCHAR(255) NOT NULL,
        city VARCHAR(50) NOT NULL,
        state VARCHAR(50) NOT NULL,
        postal_code VARCHAR(10) NOT NULL,
        country VARCHAR(50) NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );

-- Table for Payment Methods (for customers)

CREATE TABLE
    payment_methods (
        method_id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL,
        card_number VARCHAR(16) NOT NULL,
        expiration_date DATE NOT NULL,
        cvv VARCHAR(4) NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );

-- Table for Discounts or Coupons

CREATE TABLE
    discounts (
        discount_id SERIAL PRIMARY KEY,
        code VARCHAR(20) UNIQUE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL
    );