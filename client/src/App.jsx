import { Navbar,Welcome,Footer,MyServices,Transactions} from "./components";

const App = () => {
  return (
    <div>
      <div className="min-h-screen">
        <div className="gradient-bg-welcome">
          <Navbar />
          <Welcome />
        </div>
        <MyServices />
        <Transactions />
        <Footer />
      </div>
    </div>
  );
};

export default App;
