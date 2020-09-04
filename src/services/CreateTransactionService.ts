import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError(
        'Balance is not available, maybe you have to get more money!',
      );
    }

    let categoryID = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryID) {
      categoryID = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryID);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryID,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
