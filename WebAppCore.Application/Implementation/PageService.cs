﻿using System;
using System.Collections.Generic;
using System.Linq;
using WebAppCore.Application.Interfaces;
using WebAppCore.Application.Mappers;
using WebAppCore.Application.ViewModels.Blog;
using WebAppCore.Data.EF;
using WebAppCore.Data.Entities;
using WebAppCore.Data.Enums;
using WebAppCore.Infrastructure.Interfaces;
using WebAppCore.Utilities.Dtos;

namespace WebAppCore.Application.Implementation
{
	public class PageService:IPageService
	{
		private IRepository<Page,int> _pageRepository;
		private IUnitOfWork _unitOfWork;
		private AppDbContext _appDbContext;
		public PageService(IRepository<Page,int> pageRepository,
		   IUnitOfWork unitOfWork,AppDbContext appDbContext)
		{
			this._pageRepository = pageRepository;
			this._unitOfWork = unitOfWork;
			this._appDbContext = appDbContext;
		}
		public void Add(PageViewModel pageVm)
		{
			var page = pageVm.AddModel();
			_pageRepository.Add(page);
		}
		public void Delete(int id)
		{
			_pageRepository.Remove(id);
		}
		public void Dispose()
		{
			GC.SuppressFinalize(this);
		}
		public List<PageViewModel> GetAll()
		{
			return _pageRepository.FindAll().Select(x => x.ToModel()).ToList();
		}
		public PagedResult<PageViewModel> GetAllPaging(string keyword,int page,int pageSize)
		{
			var query = _pageRepository.FindAll();
			if(!string.IsNullOrEmpty(keyword))
				query = query.Where(x => x.Name.Contains(keyword));
			int totalRow = query.Count();
			var data = query.OrderByDescending(x => x.Alias)
				.Skip((page - 1) * pageSize)
				.Take(pageSize);
			var paginationSet = new PagedResult<PageViewModel>() {
				Results = data.Select(x => x.ToModel()).ToList(),
				CurrentPage = page,
				RowCount = totalRow,
				PageSize = pageSize
			};
			return paginationSet;
		}
		public PageViewModel GetByAlias(string alias)
		{
			var data = _appDbContext.Set<Page>().Where(x => x.Status == Status.Active && x.Alias == alias).FirstOrDefault();
			return data.ToModel();
		}
		public PageViewModel GetById(int id)
		{
			return _pageRepository.FindById(id).ToModel();
		}
		public void SaveChanges()
		{
			_unitOfWork.Commit();
		}
		public void Update(PageViewModel pageVm)
		{
			var page = pageVm.AddModel();
			_pageRepository.Update(page);
		}
	}
}
