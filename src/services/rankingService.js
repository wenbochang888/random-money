/**
 * 排行榜服务层
 * 
 * 功能：封装排行榜数据的存储和查询逻辑
 * 存储方式：localStorage（可切换为后端API）
 * 
 * 后端接口规范：
 * 
 * 1. 插入排行记录
 *    POST /api/v1/rankings
 *    Request Body: RankingRecord (不含id和timestamp，由后端生成)
 *    Response: { success: boolean, data: RankingRecord, message: string }
 * 
 * 2. 查询特定概率的排行榜
 *    GET /api/v1/rankings?probability={probability}&limit={limit}
 *    Response: { success: boolean, data: { probability, records, total }, message: string }
 * 
 * 3. 查询所有概率的排行榜
 *    GET /api/v1/rankings/all?limit={limit}
 *    Response: { success: boolean, data: { "1e-9": [], "1e-8": [], ... }, message: string }
 * 
 * 4. 查询用户的所有记录
 *    GET /api/v1/rankings/user/{userName}
 *    Response: { success: boolean, data: RankingRecord[], message: string }
 */

// 引入签名工具（混淆版本，防止F12破解）
import SignUtil from '@/utils/sign.js';

// ==================== 配置项 ====================

// 是否使用后端API（true: 使用后端, false: 使用localStorage）
const USE_BACKEND_API = true;

// 后端API基础URL（本地测试地址）
const API_BASE_URL = 'http://localhost:8099/api/v1';

// localStorage存储键名
const STORAGE_KEY = 'death_simulator_rankings';
const LOTTERY_STORAGE_KEY = 'lottery_game_rankings';

// 每个概率保留的最大记录数
const MAX_RECORDS_PER_PROBABILITY = 10;

// 概率值映射（用于localStorage分组）
const PROBABILITY_MAP = {
  '1e-9': '十亿分之一',
  '1e-8': '一亿分之一',
  '1e-7': '千万分之一',
  '1e-6': '百万分之一'
};

// 风险抉择抽奖次数映射
const LOTTERY_TIMES_MAP = {
  '1': '单次抽奖',
  '10': '10次抽奖',
  '100': '100次抽奖',
  '1000': '1000次抽奖',
  '10000': '10000次抽奖'
};

// ==================== 数据模型 ====================

/**
 * 排行榜记录模型
 * @typedef {Object} RankingRecord
 * @property {string} id - 唯一标识
 * @property {string} userName - 用户名
 * @property {string} probability - 概率标识 "1e-9" | "1e-8" | "1e-7" | "1e-6"
 * @property {string} probabilityLabel - 概率中文标签
 * @property {number} survivalYears - 存活年数
 * @property {number} survivalDays - 存活天数
 * @property {string} earnedMoney - 获得金额（格式化字符串）
 * @property {number} earnedMoneyValue - 获得金额（数值）
 * @property {string} timestamp - 记录时间 ISO 8601格式
 * @property {number} createdAt - 创建时间戳（用于排序）
 */

// ==================== 工具函数 ====================

/**
 * 生成唯一ID
 */
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取localStorage中的所有排行数据
 */
function getLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        '1e-9': [],
        '1e-8': [],
        '1e-7': [],
        '1e-6': []
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('读取localStorage失败:', error);
    return {
      '1e-9': [],
      '1e-8': [],
      '1e-7': [],
      '1e-6': []
    };
  }
}

/**
 * 保存数据到localStorage
 */
function setLocalStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('保存localStorage失败:', error);
    return false;
  }
}

/**
 * 对记录列表按存活时间降序排序
 */
function sortRecords(records) {
  return records.sort((a, b) => b.survivalYears - a.survivalYears);
}

// ==================== localStorage实现 ====================

/**
 * 插入排行记录（localStorage版本）
 */
function insertRankingLocal(recordData) {
  const allData = getLocalStorage();
  
  const record = {
    id: generateId(),
    userName: recordData.userName || '匿名用户',
    probability: recordData.probability,
    probabilityLabel: recordData.probabilityLabel,
    survivalYears: recordData.survivalYears,
    survivalDays: recordData.survivalDays,
    earnedMoney: recordData.earnedMoney,
    earnedMoneyValue: recordData.earnedMoneyValue,
    timestamp: new Date().toISOString(),
    createdAt: Date.now()
  };
  
  // 获取对应概率的记录列表
  const probabilityRecords = allData[record.probability] || [];
  
  // 添加新记录
  probabilityRecords.push(record);
  
  // 排序并保留TOP N
  const sortedRecords = sortRecords(probabilityRecords);
  allData[record.probability] = sortedRecords.slice(0, MAX_RECORDS_PER_PROBABILITY);
  
  // 保存到localStorage
  setLocalStorage(allData);
  
  return {
    success: true,
    data: record,
    message: '记录已保存'
  };
}

/**
 * 查询特定概率的排行榜（localStorage版本）
 */
function getRankingByProbabilityLocal(probability, limit = 10) {
  const allData = getLocalStorage();
  const records = allData[probability] || [];
  
  return {
    success: true,
    data: {
      probability,
      records: records.slice(0, limit),
      total: records.length
    },
    message: '查询成功'
  };
}

/**
 * 查询所有概率的排行榜（localStorage版本）
 */
function getAllRankingsLocal(limit = 10) {
  const allData = getLocalStorage();
  const result = {};
  
  Object.keys(PROBABILITY_MAP).forEach(prob => {
    const records = allData[prob] || [];
    result[prob] = records.slice(0, limit);
  });
  
  return {
    success: true,
    data: result,
    message: '查询成功'
  };
}

/**
 * 查询用户的所有记录（localStorage版本）
 */
function getRankingsByUserLocal(userName) {
  const allData = getLocalStorage();
  const userRecords = [];
  
  Object.keys(allData).forEach(probability => {
    const records = allData[probability] || [];
    const filtered = records.filter(r => r.userName === userName);
    userRecords.push(...filtered);
  });
  
  // 按时间降序排序
  userRecords.sort((a, b) => b.createdAt - a.createdAt);
  
  return {
    success: true,
    data: userRecords,
    message: '查询成功'
  };
}

// ==================== 后端API实现 ====================

/**
 * 插入排行记录（后端API版本）
 */
async function insertRankingAPI(recordData) {
  // 准备签名参数（所有参数转为字符串）
  const params = {
    userName: String(recordData.userName || ''),
    probability: String(recordData.probability || ''),
    probabilityLabel: String(recordData.probabilityLabel || ''),
    survivalYears: String(recordData.survivalYears || ''),
    survivalDays: String(recordData.survivalDays || ''),
    earnedMoney: String(recordData.earnedMoney || ''),
    earnedMoneyValue: String(recordData.earnedMoneyValue || '')
  };
  
  // 生成签名（包含timestamp和token）
  const signedParams = SignUtil.sign(params);
  
  // 构建带签名的URL（用于拦截器验证）
  const queryString = new URLSearchParams(signedParams).toString();
  const url = `${API_BASE_URL}/rankings?${queryString}`;
  
  // 准备RequestBody数据（用于Controller接收）
  const requestBody = {
    userName: recordData.userName,
    probability: recordData.probability,
    probabilityLabel: recordData.probabilityLabel,
    survivalYears: recordData.survivalYears,
    survivalDays: recordData.survivalDays,
    earnedMoney: recordData.earnedMoney,
    earnedMoneyValue: recordData.earnedMoneyValue
  };
  
  console.log('===== 开始发送插入请求 =====');
  console.log('请求URL:', url.replace(/token=[^&]+/, 'token=***'));
  console.log('请求Body:', JSON.stringify(requestBody, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('响应状态码:', response.status);
    
    const result = await response.json();
    
    // 检查HTTP状态码
    if (!response.ok) {
      console.error('HTTP请求失败，状态码:', response.status);
      return {
        success: false,
        data: null,
        message: `HTTP错误 ${response.status}: ${result.message || response.statusText}`
      };
    }
    
    console.log('===== 插入请求成功 =====');
    return result;
  } catch (error) {
    console.error('===== 插入请求异常 =====');
    console.error('错误信息:', error);
    return {
      success: false,
      data: null,
      message: '网络错误：' + error.message
    };
  }
}

/**
 * 查询特定概率的排行榜（后端API版本）
 */
async function getRankingByProbabilityAPI(probability, limit = 10) {
  try {
    // 准备签名参数
    const params = {
      probability: String(probability),
      limit: String(limit)
    };
    
    // 生成签名
    const signedParams = SignUtil.sign(params);
    const queryString = new URLSearchParams(signedParams).toString();
    
    const response = await fetch(
      `${API_BASE_URL}/rankings?${queryString}`,
      {
        headers: {
          'Accept': 'application/json; charset=UTF-8'
        }
      }
    );
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('查询排行榜失败:', error);
    return {
      success: false,
      data: { probability, records: [], total: 0 },
      message: '网络错误：' + error.message
    };
  }
}

/**
 * 查询所有概率的排行榜（后端API版本）
 */
async function getAllRankingsAPI(limit = 10) {
  try {
    // 准备签名参数
    const params = {
      limit: String(limit)
    };
    
    // 生成签名
    const signedParams = SignUtil.sign(params);
    const queryString = new URLSearchParams(signedParams).toString();
    
    const response = await fetch(`${API_BASE_URL}/rankings/all?${queryString}`);
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('查询所有排行榜失败:', error);
    return {
      success: false,
      data: {
        '1e-9': [],
        '1e-8': [],
        '1e-7': [],
        '1e-6': []
      },
      message: '网络错误：' + error.message
    };
  }
}

/**
 * 查询用户的所有记录（后端API版本）
 */
async function getRankingsByUserAPI(userName) {
  try {
    // 准备签名参数
    const params = {
      userName: String(userName)
    };
    
    // 生成签名
    const signedParams = SignUtil.sign(params);
    const queryString = new URLSearchParams(signedParams).toString();
    
    const response = await fetch(`${API_BASE_URL}/rankings/user/${encodeURIComponent(userName)}?${queryString}`);
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('查询用户记录失败:', error);
    return {
      success: false,
      data: [],
      message: '网络错误：' + error.message
    };
  }
}

// ==================== 统一接口（自动切换localStorage/API） ====================

/**
 * 插入排行记录
 * @param {Object} recordData - 记录数据
 * @returns {Promise<Object>} 返回结果
 */
export async function insertRanking(recordData) {
  if (USE_BACKEND_API) {
    return await insertRankingAPI(recordData);
  } else {
    return insertRankingLocal(recordData);
  }
}

/**
 * 查询特定概率的排行榜
 * @param {string} probability - 概率值 "1e-9" | "1e-8" | "1e-7" | "1e-6"
 * @param {number} limit - 返回数量，默认10
 * @returns {Promise<Object>} 返回结果
 */
export async function getRankingByProbability(probability, limit = 10) {
  if (USE_BACKEND_API) {
    return await getRankingByProbabilityAPI(probability, limit);
  } else {
    return getRankingByProbabilityLocal(probability, limit);
  }
}

/**
 * 查询所有概率的排行榜
 * @param {number} limit - 每个概率返回数量，默认10
 * @returns {Promise<Object>} 返回结果
 */
export async function getAllRankings(limit = 10) {
  if (USE_BACKEND_API) {
    return await getAllRankingsAPI(limit);
  } else {
    return getAllRankingsLocal(limit);
  }
}

/**
 * 查询用户的所有记录
 * @param {string} userName - 用户名
 * @returns {Promise<Object>} 返回结果
 */
export async function getRankingsByUser(userName) {
  if (USE_BACKEND_API) {
    return await getRankingsByUserAPI(userName);
  } else {
    return getRankingsByUserLocal(userName);
  }
}

/**
 * 清空所有排行榜数据（仅限localStorage，谨慎使用）
 */
export function clearAllRankings() {
  if (!USE_BACKEND_API) {
    localStorage.removeItem(STORAGE_KEY);
    return {
      success: true,
      message: '排行榜已清空'
    };
  } else {
    return {
      success: false,
      message: '使用后端API时无法直接清空数据'
    };
  }
}

/**
 * 获取概率标签映射
 */
export function getProbabilityMap() {
  return PROBABILITY_MAP;
}

/**
 * 切换到后端API模式（运行时切换，需要重新加载页面）
 */
export function switchToBackendAPI(apiBaseUrl) {
  console.warn('切换到后端API模式需要修改源码中的 USE_BACKEND_API 和 API_BASE_URL 配置');
  console.log('API Base URL:', apiBaseUrl);
}

// ==================== 风险抉择抽奖排行榜功能（复用死亡模拟器接口） ====================

/**
 * 风险抉择抽奖记录模型
 * @typedef {Object} LotteryRankingRecord
 * @property {string} id - 唯一标识
 * @property {string} userName - 用户名（固定"匿名用户"）
 * @property {string} lotteryTimes - 抽奖次数 "1" | "10" | "100" | "1000" | "10000"
 * @property {string} lotteryTimesLabel - 抽奖次数标签
 * @property {number} totalAmountB - 方案B总收益
 * @property {number} winCount - 成功次数
 * @property {number} loseCount - 失败次数
 * @property {number} winRate - 成功率（百分比）
 * @property {string} timestamp - 记录时间
 * @property {number} createdAt - 创建时间戳
 */

/**
 * 风险抉择抽奖数据适配器 - 将抽奖数据转换为死亡模拟器格式
 * @param {Object} lotteryData - 风险抉择抽奖数据
 * @returns {Object} 死亡模拟器格式的数据
 */
function adaptLotteryToRankingFormat(lotteryData) {
  // 将抽奖次数映射为 probability 标识
  const probability = `lottery-${lotteryData.lotteryTimes}`;
  
  // 格式化金额（复用死亡模拟器的格式化逻辑）
  const earnedMoney = formatMoneyForLottery(lotteryData.totalAmountB);
  
  // 在金额字符串中附加成功率信息（用括号包裹，便于展示）
  const earnedMoneyWithRate = `${earnedMoney} (${lotteryData.winRate.toFixed(1)}%)`;
  
  return {
    userName: lotteryData.userName || '匿名用户',  // 使用传入的用户名，如果没有则使用"匿名用户"
    probability: probability,
    probabilityLabel: lotteryData.lotteryTimesLabel,
    survivalYears: lotteryData.winCount,      // 复用字段：存储成功次数
    survivalDays: lotteryData.loseCount,      // 复用字段：存储失败次数
    earnedMoney: earnedMoneyWithRate,         // 格式化金额 + 成功率
    earnedMoneyValue: lotteryData.totalAmountB.toString()  // 总收益数值
  };
}

/**
 * 格式化金额（风险抉择抽奖专用）
 * @param {number} amount - 金额数值
 * @returns {string} 格式化后的金额字符串
 */
function formatMoneyForLottery(amount) {
  if (amount === 0) return '0元';
  
  // 转换为中文单位
  const units = [
    { name: '元', value: 1 },
    { name: '万元', value: 10000 },
    { name: '亿元', value: 100000000 },
    { name: '万亿元', value: 1000000000000 },
    { name: '千万亿元', value: 10000000000000000 }
  ];
  
  // 找到合适的单位
  for (let i = units.length - 1; i >= 0; i--) {
    if (amount >= units[i].value) {
      const value = amount / units[i].value;
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}千${units[i].name}`;
      } else {
        return `${value.toFixed(1)}${units[i].name}`;
      }
    }
  }
  
  return `${amount.toFixed(0)}元`;
}

/**
 * 将死亡模拟器格式的数据反向转换为风险抉择抽奖格式（用于查询结果展示）
 * @param {Object} rankingRecord - 死亡模拟器格式的记录
 * @returns {Object} 风险抉择抽奖格式的记录
 */
function adaptRankingToLotteryFormat(rankingRecord) {
  // 从 probability 中提取抽奖次数（格式：lottery-{次数}）
  const lotteryTimes = rankingRecord.probability.replace('lottery-', '');
  
  // 从 earnedMoney 中提取成功率（格式：金额 (99.5%)）
  const winRateMatch = rankingRecord.earnedMoney.match(/\((\d+\.?\d*)%\)/);
  const winRate = winRateMatch ? parseFloat(winRateMatch[1]) : 0;
  
  return {
    id: rankingRecord.id,
    userName: rankingRecord.userName,
    lotteryTimes: lotteryTimes,
    lotteryTimesLabel: rankingRecord.probabilityLabel,
    totalAmountB: parseFloat(rankingRecord.earnedMoneyValue),
    winCount: rankingRecord.survivalYears,     // 从复用字段中取回
    loseCount: rankingRecord.survivalDays,     // 从复用字段中取回
    winRate: winRate,
    timestamp: rankingRecord.timestamp,
    createdAt: rankingRecord.createdAt
  };
}

// 风险抉择抽奖现已复用死亡模拟器的localStorage存储逻辑
// 不再需要独立的 getLotteryLocalStorage 和 setLotteryLocalStorage 函数

/**
 * 插入风险抉择抽奖记录（localStorage版本 - 复用死亡模拟器格式）
 */
function insertLotteryRankingLocal(recordData) {
  // 先转换为死亡模拟器格式
  const adaptedData = adaptLotteryToRankingFormat(recordData);
  
  // 使用死亡模拟器的存储逻辑
  const allData = getLocalStorage();
  
  const record = {
    id: generateId(),
    ...adaptedData,
    timestamp: new Date().toISOString(),
    createdAt: Date.now()
  };
  
  // 获取对应概率的记录列表（使用 lottery-{次数} 作为key）
  const probabilityRecords = allData[record.probability] || [];
  
  // 添加新记录
  probabilityRecords.push(record);
  
  // 按总收益降序排序（使用earnedMoneyValue）
  const sortedRecords = probabilityRecords.sort((a, b) => 
    parseFloat(b.earnedMoneyValue) - parseFloat(a.earnedMoneyValue)
  );
  allData[record.probability] = sortedRecords.slice(0, MAX_RECORDS_PER_PROBABILITY);
  
  // 保存到localStorage（复用死亡模拟器的存储）
  setLocalStorage(allData);
  
  // 转换回风险抉择格式返回
  const lotteryRecord = adaptRankingToLotteryFormat(record);
  
  return {
    success: true,
    data: lotteryRecord,
    message: '记录已保存'
  };
}

/**
 * 查询特定抽奖次数的排行榜（localStorage版本 - 复用死亡模拟器格式）
 */
function getLotteryRankingByTimesLocal(lotteryTimes, limit = 10) {
  // 构造 probability 标识
  const probability = `lottery-${lotteryTimes}`;
  
  // 使用死亡模拟器的查询逻辑
  const allData = getLocalStorage();
  const records = allData[probability] || [];
  
  // 将记录转换回风险抉择格式
  const lotteryRecords = records.map(record => adaptRankingToLotteryFormat(record));
  
  return {
    success: true,
    data: {
      lotteryTimes: lotteryTimes.toString(),
      records: lotteryRecords.slice(0, limit),
      total: lotteryRecords.length
    },
    message: '查询成功'
  };
}

/**
 * 插入风险抉择抽奖记录（后端API版本 - 复用死亡模拟器接口）
 */
async function insertLotteryRankingAPI(recordData) {
  // 转换为死亡模拟器格式
  const adaptedData = adaptLotteryToRankingFormat(recordData);
  
  // 准备签名参数（所有参数转为字符串）
  const params = {
    userName: String(adaptedData.userName || ''),
    probability: String(adaptedData.probability || ''),
    probabilityLabel: String(adaptedData.probabilityLabel || ''),
    survivalYears: String(adaptedData.survivalYears || ''),
    survivalDays: String(adaptedData.survivalDays || ''),
    earnedMoney: String(adaptedData.earnedMoney || ''),
    earnedMoneyValue: String(adaptedData.earnedMoneyValue || '')
  };
  
  // 生成签名（包含timestamp和token）
  const signedParams = SignUtil.sign(params);
  
  // 构建带签名的URL（用于拦截器验证）
  const queryString = new URLSearchParams(signedParams).toString();
  const url = `${API_BASE_URL}/rankings?${queryString}`;  // 使用死亡模拟器的接口
  
  // 准备RequestBody数据（用于Controller接收）
  const requestBody = {
    userName: adaptedData.userName,
    probability: adaptedData.probability,
    probabilityLabel: adaptedData.probabilityLabel,
    survivalYears: adaptedData.survivalYears,
    survivalDays: adaptedData.survivalDays,
    earnedMoney: adaptedData.earnedMoney,
    earnedMoneyValue: adaptedData.earnedMoneyValue
  };
  
  console.log('===== 开始发送风险抉择抽奖插入请求（使用死亡模拟器接口） =====');
  console.log('请求URL:', url.replace(/token=[^&]+/, 'token=***'));
  console.log('原始数据:', JSON.stringify(recordData, null, 2));
  console.log('适配后数据:', JSON.stringify(adaptedData, null, 2));
  console.log('请求Body:', JSON.stringify(requestBody, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('响应状态码:', response.status);
    
    const result = await response.json();
    console.log('响应数据:', JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      console.error('HTTP请求失败，状态码:', response.status);
      return {
        success: false,
        data: null,
        message: `HTTP错误 ${response.status}: ${result.message || response.statusText}`
      };
    }
    
    console.log('===== 风险抉择抽奖插入请求成功 =====');
    
    // 如果后端返回了数据，转换回风险抉择格式
    if (result.success && result.data) {
      result.data = adaptRankingToLotteryFormat(result.data);
    }
    
    return result;
  } catch (error) {
    console.error('===== 风险抉择抽奖插入请求异常 =====');
    console.error('错误信息:', error);
    return {
      success: false,
      data: null,
      message: '网络错误：' + error.message
    };
  }
}

/**
 * 查询特定抽奖次数的排行榜（后端API版本 - 复用死亡模拟器接口）
 */
async function getLotteryRankingByTimesAPI(lotteryTimes, limit = 10) {
  // 构造 probability 标识
  const probability = `lottery-${lotteryTimes}`;
  
  try {
    // 准备签名参数
    const params = {
      probability: String(probability),
      limit: String(limit)
    };
    
    // 生成签名
    const signedParams = SignUtil.sign(params);
    const queryString = new URLSearchParams(signedParams).toString();
    
    const response = await fetch(
      `${API_BASE_URL}/rankings?${queryString}`,  // 使用死亡模拟器的接口
      {
        headers: {
          'Accept': 'application/json; charset=UTF-8'
        }
      }
    );
    
    const result = await response.json();
    
    // 将返回的记录转换为风险抉择格式
    if (result.success && result.data && result.data.records) {
      result.data.records = result.data.records.map(record => 
        adaptRankingToLotteryFormat(record)
      );
      // 替换返回数据的结构
      const lotteryData = {
        lotteryTimes: lotteryTimes.toString(),
        records: result.data.records,
        total: result.data.total
      };
      result.data = lotteryData;
    }
    
    return result;
  } catch (error) {
    console.error('查询风险抉择抽奖排行榜失败:', error);
    return {
      success: false,
      data: { lotteryTimes: lotteryTimes.toString(), records: [], total: 0 },
      message: '网络错误：' + error.message
    };
  }
}

/**
 * 插入风险抉择抽奖记录（统一接口）
 * @param {Object} recordData - 记录数据
 * @returns {Promise<Object>} 返回结果
 */
export async function insertLotteryRanking(recordData) {
  if (USE_BACKEND_API) {
    return await insertLotteryRankingAPI(recordData);
  } else {
    return insertLotteryRankingLocal(recordData);
  }
}

/**
 * 查询特定抽奖次数的排行榜（统一接口）
 * @param {number|string} lotteryTimes - 抽奖次数 1 | 10 | 100 | 1000 | 10000
 * @param {number} limit - 返回数量，默认10
 * @returns {Promise<Object>} 返回结果
 */
export async function getLotteryRankingByTimes(lotteryTimes, limit = 10) {
  if (USE_BACKEND_API) {
    return await getLotteryRankingByTimesAPI(lotteryTimes, limit);
  } else {
    return getLotteryRankingByTimesLocal(lotteryTimes, limit);
  }
}

/**
 * 获取抽奖次数标签映射
 */
export function getLotteryTimesMap() {
  return LOTTERY_TIMES_MAP;
}

