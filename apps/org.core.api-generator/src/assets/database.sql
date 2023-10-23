
  /*Bạn hãy điền truy vấn SQL Tại đây nhé :)*/
  /*Tạo bảng danh mục sản phẩm*/
  CREATE TABLE Category (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(255)
  );

  /*Tạo bảng sản phẩm khóa ngoại đến bảng danh mục */
  CREATE TABLE Product (
      product_id INT PRIMARY KEY,
      product_name VARCHAR(255),
      price DECIMAL(10, 2),
      stock_quantity INT,
      category_id INT,
      FOREIGN KEY (category_id) REFERENCES Category(category_id)
  );