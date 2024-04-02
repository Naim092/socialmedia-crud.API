const express = require("express");
const router = express.Router();
const conn = require("./db");

// Create category
router.post("/category/add", async (req, res) => {
    try {
      const { name, description, id } = req.body;
      if (!name || !description || !id) {
        return res.status(400).send({
          message: "Bad request: Name, description, and ID are required.",
        });
      }
  
      const idCheckQuery = `SELECT * FROM category WHERE id = ?`;
      const [idCheckResult] = await conn.promise().execute(idCheckQuery, [id]);
      if (idCheckResult.length > 0) {
        return res.status(400).send({
          message: "Bad request: ID must be unique.",
        });
      }
  
      const queryString = `INSERT INTO category (name, description, id) VALUES (?, ?, ?)`;
      const [result] = await conn.promise().execute(queryString, [name, description, id]);
  
      res.status(201).send({
        message: "Category created successfully",
        result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error while creating category",
        error,
      });
    }
  });
  

// Get all categories
router.get("/category/all", async (req, res) => {
    try {
      const queryString = `SELECT * FROM category`;
      const [result] = await conn.promise().execute(queryString);
  
      const countQueryString = `SELECT COUNT(*) AS count FROM category`;
      const [countResult] = await conn.promise().execute(countQueryString);
  
      res.status(200).send({
        message: "Successfully got all categories",
        count: countResult[0].count,
        list: result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error while getting categories",
        error,
      });
    }
  });
  

// Create product
router.post("/product/add", async (req, res) => {
  try {
    const { name, categoryId, price, description } = req.body;
    if (!name || !categoryId || !price || !description) {
      return res.status(400).send({
        message: "Bad request: Name, categoryId, price, and description are required.",
      });
    }

    const slug = generateUniqueSlug(name);
    const queryString = `INSERT INTO products (name, category_id, price, description, slug) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await conn.promise().execute(queryString, [name, categoryId, price, description, slug]);

    res.status(201).send({
      message: "Product created successfully",
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while creating product",
      error,
    });
  }
});

// Generate unique slug for product
const existingSlugs = new Set();

function generateUniqueSlug(name) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  let uniqueSlug = slug;
  let count = 1;

  while (existingSlugs.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${count}`;
    count++;
  }

  existingSlugs.add(uniqueSlug);
  return uniqueSlug;
}


// Get Single product
router.get("/product/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
  
      const queryString = `SELECT * FROM products WHERE slug = ?`;
      const [result] = await conn.promise().execute(queryString, [slug]);
  
      if (result.length === 0) {
        return res.status(404).send({
          message: "Product not found",
        });
      }
  
      res.status(200).send({
        message: "Successfully retrieved product",
        product: result[0],
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error while getting product",
        error,
      });
    }
  });
  

// Update product
router.put("/product/update/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, categoryId, price, description } = req.body;
  
      const queryString = `UPDATE products
        SET name = ?, category_id = ?, price = ?, description = ?
        WHERE id = ?`;
  
      const [result] = await conn.promise().execute(queryString, [name, categoryId, price, description, id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).send({
          message: "Product not found",
        });
      }
      res.status(200).send({
        message: "Product updated successfully",
        result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error while updating product",
        error,
      });
    }
  });
  
  // Delete product
  router.delete("/product/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const queryString = `DELETE FROM products WHERE id = ?`;
      const [result] = await conn.promise().execute(queryString, [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).send({
          message: "Product not found",
        });
      }
  
      res.status(200).send({
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error while deleting product",
        error,
      });
    }
  });


// Create multiple products
router.post("/product/addProducts", async (req, res) => {
    try {
      const products = req.body;
  
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).send({
          message: "Bad request: Products array is required.",
        });
      }
  
      const createdProducts = [];
  
      for (let i = 0; i < products.length; i++) {
        const { name, categoryId, price, description } = products[i];
  
        if (!name || !categoryId || !price || !description) {
          return res.status(400).send({
            message: `Bad request: Required fields are missing for product at index ${i}.`,
          });
        }
  
        const queryString = `INSERT INTO products (name, category_id, price, description) VALUES (?, ?, ?, ?)`;
        const [result] = await conn.promise().execute(queryString, [name, categoryId, price, description]);
  
        createdProducts.push({
          id: result.insertId,
          name,
          categoryId,
          price,
          description,
        });
      }
  
      res.status(201).send({
        message: "Products created successfully",
        products: createdProducts,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error while creating products",
        error,
      });
    }
  });
  


// Get All products
router.get("/products", async (req, res) => {
    try {
      const queryString = `SELECT * FROM products`;
      const [result] = await conn.promise().execute(queryString);
  
      const countQueryString = `SELECT COUNT(*) AS count FROM products`;
      const [countResult] = await conn.promise().execute(countQueryString);
  
      res.status(200).send({
        message: "Successfully got all products",
        count: countResult[0].count,
        list: result,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error while getting products",
        error,
      });
    }
  });



module.exports = router;