#!/bin/sh

# 等待 PostgreSQL 就绪

echo "⏳ 等待数据库就绪..."

while ! nc -z postgres 5432; do
  sleep 1
done

echo "✅ 数据库已就绪"
