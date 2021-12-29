function Error({ statusCode, title }) {
  return (
    <div>
      <p>{statusCode ? `Ошибка ${statusCode} на сервере` : 'Ошибка!'}</p>

      <p>{title}</p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
