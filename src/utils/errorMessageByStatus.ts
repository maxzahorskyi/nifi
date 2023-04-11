import { ExceptionStatusType } from 'antd/lib/result';

export const ErrorMessageByStatus: Record<ExceptionStatusType, string> = {
  403: "You don't have permission to see this page",
  404: "Sorry, the collection you are looking for doesn't exists.",
  500: 'Something went wrong on the server side. We are working on fixing this problem',
};
