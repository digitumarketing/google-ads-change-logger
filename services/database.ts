import { supabase } from '../lib/supabase';
import { User, Account, ChangeLog, Comment, PerformanceMetrics } from '../types';

interface DbChangeLog {
  id: string;
  date_of_change: string;
  account_id: string;
  campaign_name: string;
  category: string;
  description: string;
  reason: string;
  expected_impact: string;
  pre_change_ctr: number | null;
  pre_change_cpc: number | null;
  pre_change_conv_rate: number | null;
  pre_change_cpa: number | null;
  post_change_ctr: number | null;
  post_change_cpc: number | null;
  post_change_conv_rate: number | null;
  post_change_cpa: number | null;
  next_review_date: string | null;
  logged_by_id: string;
  created_by_name: string | null;
  last_edited_by_id: string | null;
  last_edited_by_name: string | null;
  last_edited_at: string | null;
  result: string;
  result_summary: string;
  created_at: string;
  updated_at: string;
}

interface DbComment {
  id: string;
  log_id: string;
  user_id: string;
  user_name: string;
  timestamp: string;
  text: string;
}

const mapDbChangeLogToChangeLog = (dbLog: DbChangeLog, comments: Comment[]): ChangeLog => {
  const preChangeMetrics: PerformanceMetrics = {
    ctr: dbLog.pre_change_ctr,
    cpc: dbLog.pre_change_cpc,
    convRate: dbLog.pre_change_conv_rate,
    cpa: dbLog.pre_change_cpa,
  };

  const postChangeMetrics: PerformanceMetrics | null =
    dbLog.post_change_ctr !== null || dbLog.post_change_cpc !== null ||
    dbLog.post_change_conv_rate !== null || dbLog.post_change_cpa !== null
      ? {
          ctr: dbLog.post_change_ctr,
          cpc: dbLog.post_change_cpc,
          convRate: dbLog.post_change_conv_rate,
          cpa: dbLog.post_change_cpa,
        }
      : null;

  return {
    id: dbLog.id,
    dateOfChange: dbLog.date_of_change,
    accountId: dbLog.account_id,
    campaignName: dbLog.campaign_name,
    category: dbLog.category as any,
    description: dbLog.description,
    reason: dbLog.reason,
    expectedImpact: dbLog.expected_impact as any,
    preChangeMetrics,
    postChangeMetrics,
    nextReviewDate: dbLog.next_review_date || undefined,
    loggedById: dbLog.logged_by_id,
    createdByName: dbLog.created_by_name || undefined,
    lastEditedById: dbLog.last_edited_by_id || undefined,
    lastEditedByName: dbLog.last_edited_by_name || undefined,
    lastEditedAt: dbLog.last_edited_at || undefined,
    createdAt: dbLog.created_at,
    updatedAt: dbLog.updated_at,
    result: dbLog.result as any,
    resultSummary: dbLog.result_summary,
    comments,
  };
};

const mapChangeLogToDb = (log: Partial<ChangeLog>, includeTracking = false) => {
  const baseData = {
    date_of_change: log.dateOfChange,
    account_id: log.accountId,
    campaign_name: log.campaignName,
    category: log.category,
    description: log.description,
    reason: log.reason,
    expected_impact: log.expectedImpact,
    pre_change_ctr: log.preChangeMetrics?.ctr,
    pre_change_cpc: log.preChangeMetrics?.cpc,
    pre_change_conv_rate: log.preChangeMetrics?.convRate,
    pre_change_cpa: log.preChangeMetrics?.cpa,
    post_change_ctr: log.postChangeMetrics?.ctr,
    post_change_cpc: log.postChangeMetrics?.cpc,
    post_change_conv_rate: log.postChangeMetrics?.convRate,
    post_change_cpa: log.postChangeMetrics?.cpa,
    next_review_date: log.nextReviewDate,
    logged_by_id: log.loggedById,
    result: log.result,
    result_summary: log.resultSummary,
  };

  if (includeTracking) {
    return {
      ...baseData,
      created_by_name: log.createdByName,
      last_edited_by_id: log.lastEditedById,
      last_edited_by_name: log.lastEditedByName,
    };
  }

  return baseData;
};

export const userService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(u => ({
      id: u.id,
      authId: u.auth_id,
      email: u.email,
      name: u.name,
      role: u.role,
    }));
  },

  async getByAuthId(authId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      authId: data.auth_id,
      email: data.email,
      name: data.name,
      role: data.role,
    };
  },

  async update(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ name: user.name, role: user.role, email: user.email })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      authId: data.auth_id,
      email: data.email,
      name: data.name,
      role: data.role,
    };
  },

  async delete(userId: string): Promise<void> {
    const user = await supabase
      .from('users')
      .select('auth_id')
      .eq('id', userId)
      .maybeSingle();

    if (user.data?.auth_id) {
      await supabase.auth.admin.deleteUser(user.data.auth_id);
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  },
};

export const accountService = {
  async getAll(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(account: Omit<Account, 'id'>): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .insert([account])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(account: Account): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .update({
        name: account.name,
        client: account.client,
        manager: account.manager,
        currency: account.currency,
        status: account.status,
        tags: account.tags,
      })
      .eq('id', account.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(accountId: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId);

    if (error) throw error;
  },

  async updateManagerName(oldName: string, newName: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({ manager: newName })
      .eq('manager', oldName);

    if (error) throw error;
  },
};

export const changeLogService = {
  async getAll(): Promise<ChangeLog[]> {
    const { data: logs, error: logsError } = await supabase
      .from('change_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (logsError) throw logsError;
    if (!logs) return [];

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .order('timestamp', { ascending: true });

    if (commentsError) throw commentsError;

    const commentsByLogId = (comments || []).reduce((acc, comment) => {
      if (!acc[comment.log_id]) {
        acc[comment.log_id] = [];
      }
      acc[comment.log_id].push({
        id: comment.id,
        logId: comment.log_id,
        userId: comment.user_id,
        userName: comment.user_name,
        timestamp: comment.timestamp,
        text: comment.text,
      });
      return acc;
    }, {} as Record<string, Comment[]>);

    return logs.map(log => mapDbChangeLogToChangeLog(log, commentsByLogId[log.id] || []));
  },

  async create(log: Omit<ChangeLog, 'id' | 'comments' | 'postChangeMetrics' | 'result' | 'resultSummary'>, userName: string): Promise<ChangeLog> {
    const dbLog = mapChangeLogToDb({
      ...log,
      createdByName: userName,
      postChangeMetrics: null,
      result: 'Pending' as any,
      resultSummary: '',
    }, true);

    const { data, error } = await supabase
      .from('change_logs')
      .insert([dbLog])
      .select()
      .single();

    if (error) throw error;
    return mapDbChangeLogToChangeLog(data, []);
  },

  async update(log: ChangeLog, userId: string, userName: string): Promise<ChangeLog> {
    const dbLog = mapChangeLogToDb({
      ...log,
      lastEditedById: userId,
      lastEditedByName: userName,
    }, true);

    const { data, error } = await supabase
      .from('change_logs')
      .update(dbLog)
      .eq('id', log.id)
      .select()
      .single();

    if (error) throw error;

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('log_id', log.id)
      .order('timestamp', { ascending: true });

    if (commentsError) throw commentsError;

    const mappedComments = (comments || []).map(comment => ({
      id: comment.id,
      logId: comment.log_id,
      userId: comment.user_id,
      userName: comment.user_name,
      timestamp: comment.timestamp,
      text: comment.text,
    }));

    return mapDbChangeLogToChangeLog(data, mappedComments);
  },
};

export const commentService = {
  async create(logId: string, userId: string, userName: string, text: string): Promise<Comment> {
    const newComment = {
      log_id: logId,
      user_id: userId,
      user_name: userName,
      timestamp: new Date().toISOString(),
      text,
    };

    const { data, error } = await supabase
      .from('comments')
      .insert([newComment])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      logId: data.log_id,
      userId: data.user_id,
      userName: data.user_name,
      timestamp: data.timestamp,
      text: data.text,
    };
  },
};
